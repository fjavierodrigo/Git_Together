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
import { of, forkJoin } from 'rxjs';
import { CategoriaSidebar } from '../categoria-sidebar/categoria-sidebar';

@Component({
  selector: 'app-foro-tema',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NavbarComponent, 
    CategoriaSidebar
  ],
  templateUrl: './foro-tema.html',
  styleUrl: './foro-tema.css'
})
export class ForoTema implements OnInit {
  temaSlug: string | null = null;
  tema: any = null;
  mensajes: any[] = [];
  categorias: any[] = [];
  tags: any[] = [];
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
      this.cargarSidebar();
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

  cargarSidebar(): void {
    // 1. Intentar cargar de la caché persistente del navegador (sessionStorage)
    const cachedCats = sessionStorage.getItem('foro_categorias_cache');
    const cachedTags = sessionStorage.getItem('foro_tags_cache');

    if (cachedCats && cachedTags) {
      this.categorias = JSON.parse(cachedCats);
      this.tags = JSON.parse(cachedTags);
      this.cdr.detectChanges();
      // Actualizamos también la caché del servicio por si acaso
      return;
    }

    // 2. Fallback: Usar la caché del servicio si existe
    const catCache = this.foroService.getCategoriasCache();
    const tagCache = this.foroService.getTagsCache();

    if (catCache.length > 0 && tagCache.length > 0) {
      this.categorias = catCache;
      this.tags = tagCache;
      this.cdr.detectChanges();
    } else {
      // 3. Último recurso: Cargar del servidor
      forkJoin({
        categorias: this.foroService.getCategorias(),
        tags: this.foroService.getTags()
      }).subscribe({
        next: (res) => {
          this.categorias = res.categorias;
          this.tags = res.tags;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCategorySelected(slug: string | null) {
    if (slug) {
      this.router.navigate(['/foro'], { queryParams: { cat: slug } });
    }
  }

  onTagSelected(tag: any) {
    if (!tag) return;
    
    // Si el tema actual tiene categoría, la incluimos en el filtro al volver al foro
    const params: any = { tag: tag.nombre };
    if (this.tema?.categoria?.slug) {
      params.cat = this.tema.categoria.slug;
    }
    
    this.router.navigate(['/foro'], { queryParams: params });
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
      { name: 'descripcion', label: 'Descripción', type: 'textarea', value: this.tema.descripcion || '' },
      { name: 'tags', label: 'Etiquetas', type: 'tags', value: this.tema.tags?.map((tt: any) => tt.tag?.nombre) || [] }
    ]);

    if (data && data.titulo?.trim()) {
      const id = this.tema.identificador || this.tema.id;
      this.foroService.editTema(id, data.titulo, data.descripcion, data.tags).subscribe({
        next: (temaActualizado) => {
          this.tema.titulo = data.titulo;
          this.tema.descripcion = data.descripcion;
          this.tema.tags = temaActualizado.tags; // Actualizar los tags con la respuesta del servidor
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

        // --- DEFENSA PARA EL AVATAR ---
        // Si el servidor nos devuelve el usuario sin avatar o con la llave antigua,
        // usamos el avatar que tenemos en la sesión local que ya está prefirmado y funcionando.
        if (res.usuario && (!res.usuario.avatar || !res.usuario.avatar.startsWith('http'))) {
          res.usuario.avatar = usuarioActual.avatar;
        }

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