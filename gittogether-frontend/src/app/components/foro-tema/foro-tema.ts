import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ForoService } from '../services/foro.service';
import { Usuario } from '../services/usuario';
import { NavbarComponent } from '../navbar/navbar';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';

import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-foro-tema',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './foro-tema.html',
  styleUrl: './foro-tema.css'
})
export class ForoTema implements OnInit {
  temaSlug: string | null = null;
  tema: any = null;
  mensajes: any[] = [];
  cargando: boolean = true;
  skeletonMensajes = Array(3).fill(0);
  
  // Para controlar qué menú de opciones (3 puntos) está abierto
  activeMenuId: string | number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private foroService: ForoService,
    private cdr: ChangeDetectorRef,
    public usuarioService: Usuario, // Inyectar Usuario service (Público para el HTML)
    private toastService: ToastService,
    private modalService: ModalService
  ) { }


  ngOnInit(): void {
    this.temaSlug = this.route.snapshot.paramMap.get('slug');
    if (this.temaSlug) {
      this.cargarDatos();
    } else {
      this.router.navigate(['/foro']);
    }
  }

  cargarDatos(): void {
    if (!this.temaSlug) return;

    this.tema = null;
    this.mensajes = [];

    // SWR Pattern: Intentar cargar del caché primero para carga instantánea
    const cacheKey = `tema_slug_${this.temaSlug}_cache`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      this.tema = parsed.tema;
      this.mensajes = parsed.mensajes;
      this.cargando = false;
    } else {
      this.cargando = true;
    }

    // Primero obtenemos el tema por slug, y luego sus mensajes usando su ID real
    this.foroService.getTemaBySlug(this.temaSlug).pipe(
      switchMap(temaRes => {
        this.tema = temaRes;
        if (temaRes && (temaRes.identificador || temaRes.id)) {
          const id = temaRes.identificador || temaRes.id;
          return this.foroService.getMensajesPorTema(id);
        }
        return of([]);
      })
    ).subscribe({
      next: (mensajesRes) => {
        this.mensajes = mensajesRes;

        // Guardar en caché para la próxima vez
        sessionStorage.setItem(cacheKey, JSON.stringify({
          tema: this.tema,
          mensajes: this.mensajes
        }));

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando el tema o mensajes", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/foro']);
  }

  toggleMenu(id: string | number, event: Event) {
    event.stopPropagation(); // Evitamos que el click llegue al document
    if (this.activeMenuId === id) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = id;
    }
  }

  // Cerrar menús al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.activeMenuId = null;
  }

  // --- PERMISOS ---
  puedeEditarTema(): boolean {
    if (!this.tema) return false;
    if (this.usuarioService.esAdmin()) return true;
    // Moderador no edita temas ajenos según requerimiento, solo Admin o Autor
    if (this.tema.usuario && this.usuarioService.esAutor(this.tema.usuario.identificador)) return true;
    return false;
  }

  puedeBorrarTema(): boolean {
    if (!this.tema) return false;
    if (this.usuarioService.esAdmin() || this.usuarioService.esModerador()) return true;
    if (this.tema.usuario && this.usuarioService.esAutor(this.tema.usuario.identificador)) return true;
    return false;
  }

  puedeEditarMensaje(mensaje: any): boolean {
    if (this.usuarioService.esAdmin()) return true;
    if (mensaje.usuario && this.usuarioService.esAutor(mensaje.usuario.identificador)) return true;
    return false;
  }

  puedeBorrarMensaje(mensaje: any): boolean {
    if (this.usuarioService.esAdmin() || this.usuarioService.esModerador()) return true;
    if (mensaje.usuario && this.usuarioService.esAutor(mensaje.usuario.identificador)) return true;
    return false;
  }

  // --- ACCIONES TEMA ---
  async borrarTema() {
    if (!this.tema) return;
    const confirmacion = await this.modalService.confirm(
      "Eliminar Tema",
      "¿Estás seguro de que deseas eliminar este tema? Esta acción no se puede deshacer.",
      true
    );
    if (confirmacion) {
      const id = this.tema.identificador || this.tema.id;
      this.foroService.deleteTema(id).subscribe({
        next: () => {
          this.toastService.success("Tema eliminado correctamente");
          this.foroService.clearCache();
          const cacheKey = `tema_slug_${this.temaSlug}_cache`;
          sessionStorage.removeItem(cacheKey); // Limpiamos la cache del tema eliminado
          this.volver();
        },
        error: (err) => {
          console.error("Error al borrar el tema", err);
          this.toastService.error("Error al borrar el tema.");
        }
      });
    }
  }

  async editarTema() {
    if (!this.tema) return;
    const data = await this.modalService.prompt("Editar Tema", [
      { name: 'titulo', label: 'Título del Tema', type: 'text', value: this.tema.titulo },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', value: this.tema.descripcion || '' }
    ]);

    if (data && data.titulo?.trim()) {
      const id = this.tema.identificador || this.tema.id;
      this.foroService.editTema(id, data.titulo, data.descripcion).subscribe({
        next: (res) => {
          this.tema.titulo = data.titulo;
          this.tema.descripcion = data.descripcion;
          this.toastService.success("Tema actualizado correctamente");
          this.foroService.clearCache();

          // Actualizamos la memoria del navegador
          const cacheKey = `tema_slug_${this.temaSlug}_cache`;
          sessionStorage.setItem(cacheKey, JSON.stringify({
            tema: this.tema,
            mensajes: this.mensajes
          }));

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al editar el tema", err);
          this.toastService.error("Error al editar el tema.");
        }
      });
    }
  }

  // --- ACCIONES MENSAJES ---
  async borrarMensaje(mensaje: any) {
    const confirmacion = await this.modalService.confirm(
      "Eliminar Mensaje",
      "¿Estás seguro de que deseas eliminar este mensaje? No podrás recuperarlo.",
      true
    );
    if (confirmacion) {
      const id = mensaje.identificador || mensaje.id;
      this.foroService.deleteMensaje(id).subscribe({
        next: () => {
          this.mensajes = this.mensajes.filter(m => (m.identificador || m.id) !== id);
          if (this.tema && this.tema.contadorMensajes > 0) {
            this.tema.contadorMensajes--;
          }

          // Actualizamos la memoria del navegador
          const cacheKey = `tema_slug_${this.temaSlug}_cache`;
          sessionStorage.setItem(cacheKey, JSON.stringify({
            tema: this.tema,
            mensajes: this.mensajes
          }));

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al borrar el mensaje", err);
          this.toastService.error("No se pudo borrar el mensaje.");
        }
      });
    }
  }

  // Estado para la edición inline de mensajes
  mensajeEditandoId: number | null = null;
  mensajeEditandoTexto: string = '';

  iniciarEdicion(mensaje: any) {
    this.mensajeEditandoId = mensaje.identificador || mensaje.id;
    this.mensajeEditandoTexto = mensaje.contenido;
  }

  cancelarEdicion() {
    this.mensajeEditandoId = null;
    this.mensajeEditandoTexto = '';
  }

  guardarEdicion(mensaje: any) {
    if (!this.mensajeEditandoTexto.trim()) return;
    const id = mensaje.identificador || mensaje.id;
    console.log("Enviando petición PUT para Mensaje ID:", id, "con contenido:", this.mensajeEditandoTexto);

    this.foroService.editMensaje(id, this.mensajeEditandoTexto).subscribe({
      next: (res) => {
        console.log("Respuesta del servidor al editar mensaje:", res);
        mensaje.contenido = this.mensajeEditandoTexto;
        this.toastService.success("Mensaje editado");
        this.cancelarEdicion();

        // Actualizamos la memoria del navegador
        const cacheKey = `tema_slug_${this.temaSlug}_cache`;
        sessionStorage.setItem(cacheKey, JSON.stringify({
          tema: this.tema,
          mensajes: this.mensajes
        }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al editar el mensaje", err);
        this.toastService.error("Error al guardar los cambios.");
      }
    });
  }

  // --- ACCIÓN COMENTAR ---
  nuevoComentario: string = '';

  comentar() {
    const usuarioActual = this.usuarioService.getUsuarioLogueado();
    if (!usuarioActual) {
      this.toastService.warning("Inicia sesión para comentar");
      return;
    }

    if (!this.nuevoComentario.trim()) return;

    const mensaje = {
      contenido: this.nuevoComentario.trim(),
      tema: { identificador: this.tema.identificador || this.tema.id },
      usuario: { identificador: usuarioActual.identificador || usuarioActual.id }
    };

    console.log("Publicando comentario:", mensaje);
    this.foroService.createMensaje(mensaje).subscribe({
      next: (res) => {
        console.log("Comentario publicado:", res);
        this.toastService.success("¡Mensaje enviado!");
        // Añadir el nuevo mensaje a la lista local
        this.mensajes.push(res);
        if (this.tema) {
          this.tema.contadorMensajes = (this.tema.contadorMensajes || 0) + 1;
        }
        this.nuevoComentario = '';

        // Actualizar caché
        const cacheKey = `tema_slug_${this.temaSlug}_cache`;
        sessionStorage.setItem(cacheKey, JSON.stringify({
          tema: this.tema,
          mensajes: this.mensajes
        }));

        this.cdr.detectChanges();

        // Hacer scroll al final para ver el nuevo comentario
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      },
      error: (err) => {
        console.error("Error al publicar el comentario", err);
        this.toastService.error("Error al enviar el comentario");
      }
    });
  }
}
