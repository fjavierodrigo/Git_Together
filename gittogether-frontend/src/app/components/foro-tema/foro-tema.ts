import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild, ElementRef, Inject } from '@angular/core';
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
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-foro-tema',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    CategoriaSidebar,
    MarkdownComponent
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
  temasRelacionados: any[] = [];
  cargando: boolean = true;
  skeletonMensajes = Array(3).fill(0);

  // Para controlar qué menú de opciones (3 puntos) está abierto
  activeMenuId: string | number | null = null;

  @ViewChild('innerContainer') innerContainer!: ElementRef;
  @ViewChild('replyTextarea') replyTextarea!: ElementRef;

  nuevoComentario: string = '';
  mostrandoFormulario: boolean = false;
  archivosSeleccionados: File[] = [];

  // Lightbox para visualizar imágenes
  lightboxUrl: string | null = null;
  lightboxNombre: string = '';
  lightboxArchivo: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private foroService: ForoService,
    private cdr: ChangeDetectorRef,
    @Inject(Usuario) public usuarioService: any, // Inyectar Usuario service (Público para el HTML)
    private toastService: ToastService,
    private modalService: ModalService
  ) { }


  ngOnInit(): void {
    // Escuchar cambios en el slug de la URL para recargar datos sin refrescar la página
    this.route.paramMap.subscribe(params => {
      this.temaSlug = params.get('slug');
      if (this.temaSlug) {
        this.cargarDatos();
        this.cargarSidebar();
      } else {
        this.router.navigate(['/foro']);
      }
    });
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
        this.cargarTemasRelacionados();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando el tema o mensajes", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarTemasRelacionados(): void {
    if (!this.tema || !this.tema.tags || this.tema.tags.length === 0) return;

    this.foroService.getTemas().subscribe(allTemas => {
      // Filtrar temas que compartan al menos un tag, excluyendo el actual
      const currentTagIds = this.tema.tags.map((tt: any) => tt.tag?.identificador || tt.tag?.id);

      this.temasRelacionados = allTemas.filter((t: any) => {
        const isSame = (t.identificador || t.id) === (this.tema.identificador || this.tema.id);
        if (isSame) return false;

        const hasCommonTag = t.tags?.some((tt: any) =>
          currentTagIds.includes(tt.tag?.identificador || tt.tag?.id)
        );
        return hasCommonTag;
      }).slice(0, 5); // Limitar a 5 sugerencias

      this.cdr.detectChanges();
    });
  }

  verTemaRelacionado(tema: any) {
    this.router.navigate(['/foro/tema', tema.slug]).then(() => {
      // Al usar subscribe en ngOnInit, la carga se dispara sola al cambiar la URL
      if (this.innerContainer) {
        this.innerContainer.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
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
    const oldFiles = this.tema.archivos ? [...this.tema.archivos] : [];
    const data = await this.modalService.prompt("Editar Tema", [
      { name: 'titulo', label: 'Título del Tema', type: 'text', value: this.tema.titulo },
      { name: 'descripcion', label: 'Descripción', type: 'markdown', value: this.tema.descripcion || '' },
      { name: 'tags', label: 'Etiquetas', type: 'tags', value: this.tema.tags?.map((tt: any) => tt.tag?.nombre) || [] },
      { name: 'archivos', label: 'Archivos Adjuntos (Nuevos y Existentes)', type: 'files', value: [...oldFiles] }
    ], true);

    if (data && data.titulo?.trim()) {
      const id = this.tema.identificador || this.tema.id;
      const finalFiles = data.archivos || [];

      // Encontrar archivos eliminados (estaban en oldFiles pero no en finalFiles)
      const filesToDelete = oldFiles.filter(old => !finalFiles.some((f: any) => f.identificador === old.identificador));
      // Encontrar nuevos archivos (no tienen identificador)
      const newFiles = finalFiles.filter((f: any) => !f.identificador);

      // Borrar archivos eliminados
      for (let fd of filesToDelete) {
        this.foroService.eliminarArchivo(fd.identificador || fd.id).subscribe();
      }

      this.foroService.editTema(id, data.titulo, data.descripcion, data.tags).subscribe({
        next: (temaActualizado) => {
          this.tema.titulo = data.titulo;
          this.tema.descripcion = data.descripcion;
          this.tema.tags = temaActualizado.tags; // Actualizar los tags con la respuesta del servidor

          if (newFiles.length > 0) {
            const uploadTasks = newFiles.map((file: File) =>
              this.foroService.subirArchivoTema(id, this.usuarioService.getUsuarioLogueado().identificador || this.usuarioService.getUsuarioLogueado().id, file)
            );
            forkJoin(uploadTasks).subscribe(() => this.cargarDatos());
          } else {
            if (filesToDelete.length > 0) this.cargarDatos(); // Refresh if files were deleted
          }

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

  async editarMensaje(mensaje: any) {
    const oldFiles = mensaje.archivos ? [...mensaje.archivos] : [];
    const data = await this.modalService.prompt("Editar Mensaje", [
      { name: 'contenido', label: 'Mensaje', type: 'markdown', value: mensaje.contenido || '' },
      { name: 'archivos', label: 'Archivos Adjuntos (Nuevos y Existentes)', type: 'files', value: [...oldFiles] }
    ], true);

    if (data && data.contenido?.trim()) {
      const id = mensaje.identificador || mensaje.id;
      const finalFiles = data.archivos || [];

      const filesToDelete = oldFiles.filter(old => !finalFiles.some((f: any) => f.identificador === old.identificador));
      const newFiles = finalFiles.filter((f: any) => !f.identificador);

      for (let fd of filesToDelete) {
        this.foroService.eliminarArchivo(fd.identificador || fd.id).subscribe();
      }

      this.foroService.editMensaje(id, data.contenido).subscribe({
        next: (res) => {
          mensaje.contenido = data.contenido;

          if (newFiles.length > 0) {
            const uploadTasks = newFiles.map((file: File) =>
              this.foroService.subirArchivoMensaje(id, this.usuarioService.getUsuarioLogueado().identificador || this.usuarioService.getUsuarioLogueado().id, file)
            );
            forkJoin(uploadTasks).subscribe(() => this.cargarDatos());
          } else {
            if (filesToDelete.length > 0) this.cargarDatos(); // Refresh if files were deleted
          }

          this.toastService.success("Mensaje editado");

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
  }

  // --- ACCIÓN COMENTAR ---

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

        // Si hay archivos seleccionados, subirlos
        if (this.archivosSeleccionados.length > 0) {
          const uploadTasks = this.archivosSeleccionados.map(file =>
            this.foroService.subirArchivoMensaje(res.identificador || res.id, usuarioActual.identificador || usuarioActual.id, file)
          );

          forkJoin(uploadTasks).subscribe({
            next: (archivosSubidos) => {
              res.archivos = archivosSubidos;
              this.archivosSeleccionados = [];
              this.finalizarComentario(res);
            },
            error: (err) => {
              console.error("Error al subir archivos", err);
              this.toastService.error("Mensaje publicado, pero hubo un error al subir los archivos");
              this.archivosSeleccionados = [];
              this.finalizarComentario(res);
            }
          });
        } else {
          this.finalizarComentario(res);
        }
      },
      error: (err) => {
        console.error("Error al publicar el comentario", err);
        this.toastService.error("Error al enviar el comentario");
      }
    });
  }

  private finalizarComentario(nuevoMensaje: any) {
    // Añadir el nuevo mensaje a la lista local
    this.mensajes.push(nuevoMensaje);
    if (this.tema) {
      this.tema.contadorMensajes = (this.tema.contadorMensajes || 0) + 1;
    }
    this.nuevoComentario = '';
    this.mostrandoFormulario = false;

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
  }

  // --- MÉTODOS PARA ARCHIVOS ---
  onArchivosSeleccionados(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.archivosSeleccionados = Array.from(event.target.files);
    }
  }

  removerArchivo(index: number) {
    this.archivosSeleccionados.splice(index, 1);
  }

  esImagen(nombreArchivo: string): boolean {
    if (!nombreArchivo) return false;
    const extension = nombreArchivo.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '');
  }

  abrirLightbox(archivo: any, event: Event) {
    event.preventDefault();
    this.lightboxUrl = archivo.url;
    this.lightboxNombre = archivo.nombreOriginal;
    this.lightboxArchivo = archivo;
  }

  cerrarLightbox() {
    this.lightboxUrl = null;
    this.lightboxNombre = '';
    this.lightboxArchivo = null;
  }

  descargarArchivo(archivo: any, event: Event) {
    event.preventDefault();
    const id = archivo.identificador || archivo.id;
    
    // Si no tenemos ID (por ejemplo, archivos temporales del lightbox), usamos la URL de S3
    if (!id) {
        if (archivo.url) window.location.href = archivo.url;
        return;
    }

    // Usamos el endpoint proxy del backend.
    // Al ser del mismo dominio que la API, el navegador respeta el "Content-Disposition: attachment"
    // y abre directamente el explorador de archivos para guardar.
    const backendUrl = `http://localhost:8080/api/archivos/${id}/descargar`;
    const a = document.createElement('a');
    a.href = backendUrl;
    a.download = archivo.nombreOriginal || 'descarga';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 150);
  }

  // --- MÉTODOS PARA EL TOOLBAR DE MARKDOWN ---
  insertarMarkdown(tag: string, isBlock: boolean = false) {
    const selector = '.reply-textarea';
    const textarea = document.querySelector(selector) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textoOriginal = this.nuevoComentario;
    const seleccion = textoOriginal.substring(start, end);

    let nuevoTexto = '';

    switch (tag) {
      case 'bold':
        nuevoTexto = `**${seleccion || 'texto'}**`;
        break;
      case 'italic':
        nuevoTexto = `*${seleccion || 'texto'}*`;
        break;
      case 'code':
        nuevoTexto = isBlock ? `\n\`\`\`javascript\n${seleccion || '// código aquí'}\n\`\`\`\n` : `\`${seleccion || 'código'}\``;
        break;
      case 'h1':
        nuevoTexto = `\n# ${seleccion || 'Título'}\n`;
        break;
      case 'link':
        nuevoTexto = `[${seleccion || 'enlace'}](https://...)`;
        break;
      case 'list':
        nuevoTexto = `\n- ${seleccion || 'elemento'}`;
        break;
    }

    this.nuevoComentario = textoOriginal.substring(0, start) + nuevoTexto + textoOriginal.substring(end);

    // Devolver el foco y ajustar cursor
    setTimeout(() => {
      textarea.focus();
      const pos = start + nuevoTexto.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  }


  // Método para forzar la actualización de la posición del cursor

  // Método para forzar la actualización de la posición del cursor
  actualizarPosicionCursor(event: any) {
    // Este método puede estar vacío; su propósito principal es disparar
    // la detección de cambios de Angular cuando el usuario interactúa con el textarea.
  }
}