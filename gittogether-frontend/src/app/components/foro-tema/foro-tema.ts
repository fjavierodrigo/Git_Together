import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ForoService } from '../services/foro.service';
import { Usuario } from '../services/usuario';
import { NavbarComponent } from '../navbar/navbar';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private foroService: ForoService,
    private cdr: ChangeDetectorRef,
    private usuarioService: Usuario // Inyectar Usuario service
  ) {}

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
    const cachedData = localStorage.getItem(cacheKey);

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
        localStorage.setItem(cacheKey, JSON.stringify({
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
  borrarTema() {
    if (!this.tema) return;
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este tema? Esta acción no se puede deshacer.");
    if (confirmacion) {
      const id = this.tema.identificador || this.tema.id;
      this.foroService.deleteTema(id).subscribe({
        next: () => {
          this.foroService.clearCache();
          const cacheKey = `tema_slug_${this.temaSlug}_cache`;
          localStorage.removeItem(cacheKey); // Limpiamos la cache del tema eliminado
          this.volver();
        },
        error: (err) => {
          console.error("Error al borrar el tema", err);
          alert("Error al borrar el tema en el servidor. Revisa la consola.");
        }
      });
    }
  }

  editarTema() {
    if (!this.tema) return;
    const nuevoTitulo = window.prompt("Editar título del tema:", this.tema.titulo);
    if (nuevoTitulo !== null && nuevoTitulo.trim() !== "") {
      const id = this.tema.identificador || this.tema.id;
      console.log("Enviando petición PUT para Tema ID:", id, "con título:", nuevoTitulo);
      
      this.foroService.editTema(id, nuevoTitulo).subscribe({
        next: (res) => {
          console.log("Respuesta del servidor al editar tema:", res);
          this.tema.titulo = nuevoTitulo;
          this.foroService.clearCache();
          
          // Actualizamos la memoria del navegador
          const cacheKey = `tema_slug_${this.temaSlug}_cache`;
          localStorage.setItem(cacheKey, JSON.stringify({
            tema: this.tema,
            mensajes: this.mensajes
          }));
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al editar el tema", err);
          alert("Error al editar el tema. Asegúrate de que el servidor está guardando correctamente.");
        }
      });
    }
  }

  // --- ACCIONES MENSAJES ---
  borrarMensaje(mensaje: any) {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este mensaje?");
    if (confirmacion) {
      const id = mensaje.identificador || mensaje.id;
      this.foroService.deleteMensaje(id).subscribe({
        next: () => {
          this.mensajes = this.mensajes.filter(m => (m.identificador || m.id) !== id);
          
          // Actualizamos la memoria del navegador
          const cacheKey = `tema_slug_${this.temaSlug}_cache`;
          localStorage.setItem(cacheKey, JSON.stringify({
            tema: this.tema,
            mensajes: this.mensajes
          }));
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al borrar el mensaje", err);
          alert("Error al borrar el mensaje en el servidor.");
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
        this.cancelarEdicion();
        
        // Actualizamos la memoria del navegador
        const cacheKey = `tema_slug_${this.temaSlug}_cache`;
        localStorage.setItem(cacheKey, JSON.stringify({
          tema: this.tema,
          mensajes: this.mensajes
        }));
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al editar el mensaje", err);
        alert("Error al editar el mensaje. Revisa la consola.");
      }
    });
  }
}
