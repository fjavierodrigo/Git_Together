import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForoService } from '../services/foro.service';
import { Usuario } from '../services/usuario';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';

import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar';
import { CategoriaSidebar } from '../categoria-sidebar/categoria-sidebar';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, CategoriaSidebar],
  templateUrl: './foro.html',
  styleUrl: './foro.css'
})
export class Foro implements OnInit {
  @ViewChild('mainContent') mainContent!: ElementRef;
  private scrollRestaurado = false;

  // Lista de Temas y Categorias: Almacena todos los temas y categorias obtenidos del backend o del caché
  temas: any[] = [];
  categorias: any[] = [];
  tags: any[] = [];
  // Búsqueda: Texto introducido por el usuario en la barra de búsqueda superior
  searchQuery: string = '';
  // Estado de Carga: Indica si la aplicación está esperando datos del servidor
  cargando: boolean = true;
  // Skeletons de Temas y Categorias: Arreglo auxiliar para mostrar efectos de carga en la lista de temas y categorias cuando aun no hay datos
  skeletonArray = Array(5).fill(0);
  skeletonCats = Array(6).fill(0);

  // Categoría Seleccionada: Almacena la categoría activa para filtrar los temas mostrados
  categoriaActiva: any = null;
  tagActivo: any = null;

  // Para controlar qué menú de opciones (3 puntos) está abierto
  activeMenuId: string | number | null = null;

  // Inyección de Dependencias: Inicializamos los servicios necesarios para el funcionamiento del componente
  constructor(private foroService: ForoService, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef, public usuarioService: Usuario, private toastService: ToastService, private modalService: ModalService) { 
    // Verificamos instantáneamente si tenemos datos en el servicio para evitar el estado de carga (skeletons)
    const temasSnapshot = this.foroService.getTemasSnapshot();
    if (temasSnapshot && temasSnapshot.length > 0) {
      this.temas = temasSnapshot;
      this.cargando = false;
    }
  }


  // Ciclo de Vida OnInit: Punto de entrada principal al renderizar el componente
  ngOnInit(): void {
    // 1. Suscripciones Reactivas: Los datos fluyen instantáneamente desde el servicio
    this.foroService.temas$.subscribe(temas => {
      this.temas = temas;
      if (temas.length > 0) {
        this.cargando = false;
        this.restaurarScroll();
      }
      this.cdr.detectChanges();
    });

    this.foroService.categorias$.subscribe(cats => {
      this.categorias = cats;
      this.actualizarFiltrosDesdeUrl();
      this.cdr.detectChanges();
    });

    this.foroService.tags$.subscribe(tags => {
      this.tags = tags;
      this.actualizarFiltrosDesdeUrl();
      this.cdr.detectChanges();
    });

    // 2. Sincronización con la URL
    this.route.queryParams.subscribe(() => {
      this.actualizarFiltrosDesdeUrl();
    });

    // 3. Disparar carga/refresco inicial
    this.foroService.cargarTodo();
  }

  private actualizarFiltrosDesdeUrl() {
    const params = this.route.snapshot.queryParams;
    if (params['cat'] && this.categorias.length > 0) {
      this.categoriaActiva = this.categorias.find((c: any) => c.slug === params['cat']) || null;
    }
    if (params['tag'] && this.tags.length > 0) {
      this.tagActivo = this.tags.find((t: any) => t.nombre === params['tag']) || null;
    }
    this.cdr.detectChanges();
  }

  // Selección de Categoría: Lógica para filtrar por una categoría específica o desmarcarla
  onCategorySelected(slug: string | null) {
    this.categoriaActiva = this.categorias.find(c => c.slug === slug) || null;
    this.cdr.detectChanges();
  }

  onTagSelected(tag: any) {
    this.tagActivo = tag; // Si tag es null, se deselecciona
    this.cdr.detectChanges();
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

  // Propiedad Calculada: Devuelve la lista de temas aplicando los filtros activos en tiempo real
  get temasFiltrados() {
    // Copia Temporal: Empezamos con la lista completa de temas disponibles
    let filtrados = this.temas;

    // Filtro por Categoría: Si hay una categoría seleccionada, buscamos solo sus temas
    if (this.categoriaActiva) {
      // Comparación de Slugs: Filtramos los temas cuyo slug de categoría coincida con la activa
      filtrados = filtrados.filter(t => t.categoria?.slug === this.categoriaActiva.slug);
    }

    // Filtro por Tag (usando la estructura TemaTag -> Tag -> identificador)
    if (this.tagActivo) {
      filtrados = filtrados.filter(t => 
        t.tags?.some((tt: any) => tt.tag?.identificador === this.tagActivo.identificador)
      );
    }

    // Filtro de Texto: Si el usuario ha escrito algo, refinamos la búsqueda
    if (this.searchQuery) {
      // Búsqueda insensible a mayúsculas: Comparamos el título del tema con el texto de búsqueda
      filtrados = filtrados.filter(t =>
        t.titulo.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Resultado Final: Devolvemos solo los temas que superaron todos los filtros activos
    return filtrados;
  }

  // Navegación: Redirige al usuario a la página de detalle del tema seleccionado
  verTema(tema: any) {
    if (tema && tema.slug) {
      if (this.mainContent) {
        sessionStorage.setItem('foroScrollPosition', this.mainContent.nativeElement.scrollTop.toString());
      }
      this.router.navigate(['/foro/tema', tema.slug]);
    }
  }

  // Restaura el scroll guardado previamente al volver desde un tema
  restaurarScroll() {
    if (this.scrollRestaurado) return;

    setTimeout(() => {
      if (this.mainContent) {
        const scroll = sessionStorage.getItem('foroScrollPosition');
        if (scroll) {
          // Desactivamos momentáneamente el scroll suave para que sea instantáneo
          this.mainContent.nativeElement.style.scrollBehavior = 'auto';
          this.mainContent.nativeElement.scrollTop = parseInt(scroll, 10);

          // Y luego volvemos a dejar el valor por defecto en css
          setTimeout(() => {
            if (this.mainContent) {
              this.mainContent.nativeElement.style.scrollBehavior = '';
            }
          }, 50);
        }
        this.scrollRestaurado = true;
      }
    }, 10); // Un pequeño margen para que Angular termine de renderizar el *ngFor
  }

  // --- PERMISOS ---
  puedeEditarTema(tema: any): boolean {
    if (this.usuarioService.esAdmin()) return true;
    if (tema.usuario && this.usuarioService.esAutor(tema.usuario.identificador)) return true;
    return false;
  }

  puedeBorrarTema(tema: any): boolean {
    if (this.usuarioService.esAdmin() || this.usuarioService.esModerador()) return true;
    if (tema.usuario && this.usuarioService.esAutor(tema.usuario.identificador)) return true;
    return false;
  }

  esAdmin(): boolean {
    return this.usuarioService.esAdmin();
  }

  // --- ACCIONES TEMA ---
  async borrarTema(tema: any, event: Event) {
    event.stopPropagation(); // Evitar que el clic abra el tema
    const confirmacion = await this.modalService.confirm(
      "Eliminar Tema",
      "¿Estás seguro de que deseas eliminar este tema? Esta acción no se puede deshacer.",
      true
    );
    if (confirmacion) {
      const id = tema.identificador || tema.id;
      this.foroService.deleteTema(id).subscribe({
        next: () => {
          this.toastService.success("Tema eliminado");
        },
        error: (err) => {
          console.error("Error al borrar el tema", err);
          this.toastService.error("Error al borrar el tema.");
        }
      });
    }
  }

  async editarTema(tema: any, event: Event) {
    event.stopPropagation();
    
    // Obtenemos los archivos actuales (si no existen en el objeto resumido, se asume vacío)
    const oldFiles = tema.archivos ? [...tema.archivos] : [];
    
    const data = await this.modalService.prompt("Editar Tema", [
      { name: 'titulo', label: 'Título del Tema', type: 'text', value: tema.titulo },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', value: tema.descripcion || '' },
      { name: 'tags', label: 'Etiquetas', type: 'tags', value: tema.tags?.map((tt: any) => tt.tag?.nombre) || [] },
      { name: 'archivos', label: 'Archivos Adjuntos', type: 'files', value: [...oldFiles] }
    ]);

    if (data && data.titulo?.trim()) {
      const id = tema.identificador || tema.id;
      const finalFiles = data.archivos || [];
      const filesToDelete = oldFiles.filter(old => !finalFiles.some((f: any) => (f.identificador || f.id) === (old.identificador || old.id)));
      const newFiles = finalFiles.filter((f: any) => !f.identificador && !f.id);

      // 1. Borrar archivos eliminados
      for (let fd of filesToDelete) {
        this.foroService.eliminarArchivo(fd.identificador || fd.id).subscribe();
      }

      // 2. Actualizar datos básicos
      this.foroService.editTema(id, data.titulo, data.descripcion, data.tags).subscribe({
        next: () => {
          this.toastService.success("Tema actualizado correctamente");
          
          // 3. Subir nuevos archivos si hay
          if (newFiles.length > 0) {
            const uploadTasks = newFiles.map((file: File) =>
              this.foroService.subirArchivoTema(id, this.usuarioService.getUsuarioLogueado().identificador || this.usuarioService.getUsuarioLogueado().id, file)
            );
            forkJoin(uploadTasks).subscribe({
              next: () => {
                this.foroService.cargarTodo(); // Recargar para ver los cambios
              }
            });
          } else {
            this.foroService.cargarTodo();
          }
          
          sessionStorage.removeItem(`tema_slug_${tema.slug}_cache`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al editar el tema", err);
          this.toastService.error("Error al editar el tema.");
        }
      });
    }
  }

  // Métodos que ahora delega el sidebar pero que el componente principal necesita conocer
  actualizarCategorias() {
    this.foroService.getCategorias().subscribe();
  }

  // --- ACCIÓN CREAR TEMA ---
  async crearTema() {
    const usuarioActual = this.usuarioService.getUsuarioLogueado();
    if (!usuarioActual) {
      this.toastService.warning("Debes iniciar sesión para crear un tema.");
      return;
    }

    if (!this.categoriaActiva) {
      this.toastService.info("Por favor, selecciona una categoría antes de crear un tema.");
      return;
    }

    const data = await this.modalService.prompt(`Nuevo Tema en "${this.categoriaActiva.nombre}"`, [
      { name: 'titulo', label: 'Título del Tema', type: 'text', placeholder: 'Escribe un título atractivo...' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: '¿De qué trata este tema?' },
      { name: 'tags', label: 'Etiquetas', type: 'tags', value: [], placeholder: 'Busca o añade etiquetas...' },
      { name: 'archivos', label: 'Archivos Adjuntos', type: 'files', value: [] }
    ]);

    if (data && data.titulo?.trim()) {
      // Procesar tags: el modal ahora devuelve un array de strings
      const tagsArray = (data.tags || [])
        .map((tag: string) => ({ tag: { nombre: tag.trim() } }))
        .filter((tt: any) => tt.tag.nombre.length > 0);

      const nuevoTema = {
        titulo: data.titulo.trim(),
        descripcion: (data.descripcion || '').trim(),
        slug: this.generarSlug(data.titulo.trim()),
        categoria: { identificador: this.categoriaActiva.identificador || this.categoriaActiva.id },
        usuario: { identificador: usuarioActual.identificador || usuarioActual.id },
        tags: tagsArray
      };

      this.foroService.createTema(nuevoTema).subscribe({
        next: (res) => {
          const filesToUpload: File[] = data.archivos || [];
          if (filesToUpload.length > 0) {
              const uploadTasks = filesToUpload.map(file => 
                  this.foroService.subirArchivoTema(res.identificador || res.id, usuarioActual.identificador || usuarioActual.id, file)
              );
              
              forkJoin(uploadTasks).subscribe({
                  next: () => {
                      this.toastService.success("¡Tema creado con éxito!");
                  },
                  error: (err) => {
                      console.error("Error al subir archivos del tema", err);
                      this.toastService.error("Tema creado, pero hubo un error al subir archivos.");
                  }
              });
          } else {
              this.toastService.success("¡Tema creado con éxito!");
          }
        },
        error: (err) => {
          console.error("Error al crear el tema", err);
          this.toastService.error("Error al crear el tema.");
        }
      });
    }
  }

  generarSlug(texto: string): string {
    return texto.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();
  }

  trackByTemaId(index: number, tema: any): number | string {
    return tema.identificador || tema.id || index;
  }
}