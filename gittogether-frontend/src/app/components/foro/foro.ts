import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForoService } from '../services/foro.service';
import { Usuario } from '../services/usuario';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';

import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './foro.html',
  styleUrl: './foro.css'
})
export class Foro implements OnInit {
  @ViewChild('mainContent') mainContent!: ElementRef;
  private scrollRestaurado = false;

  // Lista de Temas y Categorias: Almacena todos los temas y categorias obtenidos del backend o del caché
  temas: any[] = [];
  categorias: any[] = [];
  // Búsqueda: Texto introducido por el usuario en la barra de búsqueda superior
  searchQuery: string = '';
  // Estado de Carga: Indica si la aplicación está esperando datos del servidor
  cargando: boolean = true;
  // Skeletons de Temas y Categorias: Arreglo auxiliar para mostrar efectos de carga en la lista de temas y categorias cuando aun no hay datos
  skeletonArray = Array(5).fill(0);
  skeletonCats = Array(6).fill(0);

  // Categoría Seleccionada: Almacena la categoría activa para filtrar los temas mostrados
  categoriaActiva: any = null;

  // Para controlar qué menú de opciones (3 puntos) está abierto
  activeMenuId: string | number | null = null;

  // Inyección de Dependencias: Inicializamos los servicios necesarios para el funcionamiento del componente
  /*private cdr: ChangeDetectorRef -> Dependencia para que Angular actualice la vista sin necesidad de interaccion del usuario al detectar cambios en los datos*/
  constructor(private foroService: ForoService, private router: Router, private cdr: ChangeDetectorRef, public usuarioService: Usuario, private toastService: ToastService, private modalService: ModalService) { }


  // Ciclo de Vida OnInit: Punto de entrada principal al renderizar el componente
  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  // Método de Carga: Gestiona la obtención de temas y categorías mediante el patrón SWR
  cargarDatosIniciales() {
    // Caché de Temas y Categorias: Intentamos recuperar los datos guardados localmente
    const cachedTemas = sessionStorage.getItem('foro_temas_cache');
    const cachedCats = sessionStorage.getItem('foro_categorias_cache');

    // Validación de Caché: Si hay datos guardados, los mostramos inmediatamente para evitar esperas
    if (cachedTemas && cachedCats) {
      this.temas = JSON.parse(cachedTemas);
      this.categorias = JSON.parse(cachedCats);
      // Feedback Instantáneo: Desactivamos el estado de carga porque ya tenemos datos que mostrar
      this.cargando = false;
      this.restaurarScroll();
    } else {
      // Estado Inicial: Si no hay caché, activamos los componentes de carga (skeletons) hasta que llegen los datos
      this.cargando = true;
    }

    // Actualización en Background: Consultamos al servidor para obtener todos los datos al mismo tiempo sin bloquear al usuario
    forkJoin({
      categorias: this.foroService.getCategorias(true),
      temas: this.foroService.getTemas(true)
    }).subscribe({
      // Respuesta Exitosa: Procesamos los datos recibidos del backend
      next: (res) => {
        // Actualizamos las listas con la respuesta del servidor
        this.categorias = res.categorias;
        this.temas = res.temas;

        // Actualización Local de Temas y Categorías: Guardamos las nuevos temas y categorias en el caché local
        sessionStorage.setItem('foro_categorias_cache', JSON.stringify(res.categorias));
        sessionStorage.setItem('foro_temas_cache', JSON.stringify(res.temas));

        // Finalización de Carga: Indicamos que ya no estamos esperando datos
        this.cargando = false;
        // Sincronización de Vista: Forzamos a Angular a detectar los cambios para actualizar el HTML inmediatamente
        this.cdr.detectChanges();
        this.restaurarScroll();
      },
      // Gestión de Errores: Manejamos posibles fallos en la comunicación con el servidor
      error: (err) => {
        // Log de Error: Mostramos el detalle técnico en la consola del navegador
        console.error("Error cargando el foro desde el backend", err);
        // Desbloqueo de UI: Aunque falle la red, quitamos el estado de carga para permitir interacción
        this.cargando = false;
        // Refresco de Interfaz: Aseguramos que el mensaje de error o el estado vacío se pinten correctamente
        this.cdr.detectChanges();
      }
    });
  }

  // Selección de Categoría: Lógica para filtrar por una categoría específica o desmarcarla
  seleccionarCategoria(cat: any) {
    // Comprobación de Reincidencia: Si pulsamos en la categoría que ya estaba activa, la quitamos
    if (this.categoriaActiva && this.categoriaActiva.identificador === cat.identificador) {
      // Estado de Desmarcado: Volvemos a mostrar todos los temas al resetear la categoría activa
      this.categoriaActiva = null;
    } else {
      // Estado de Selección: Aplicamos la nueva categoría al filtro
      this.categoriaActiva = cat;
    }
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
      // Comparación de Identificadores: Filtramos los temas cuyo ID de categoría coincida con la activa
      filtrados = filtrados.filter(t => t.categoria?.identificador === this.categoriaActiva.identificador);
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
          this.temas = this.temas.filter(t => (t.identificador || t.id) !== id);
          this.foroService.clearCache();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al borrar el tema", err);
          this.toastService.error("Error al borrar el tema en el servidor.");
        }
      });
    }
  }

  async editarTema(tema: any, event: Event) {
    event.stopPropagation(); // Evitar que el clic abra el tema
    const data = await this.modalService.prompt("Editar Tema", [
      { name: 'titulo', label: 'Título del Tema', type: 'text', value: tema.titulo },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', value: tema.descripcion || '' }
    ]);

    if (data && data.titulo?.trim()) {
      const id = tema.identificador || tema.id;
      this.foroService.editTema(id, data.titulo, data.descripcion).subscribe({
        next: (res) => {
          tema.titulo = data.titulo;
          tema.descripcion = data.descripcion;
          this.foroService.clearCache();
          this.toastService.success("Tema actualizado correctamente");
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

  // --- ACCIONES CATEGORIA ---
  async borrarCategoria(cat: any, event: Event) {
    event.stopPropagation();
    const confirmacion = await this.modalService.confirm(
      "Eliminar Categoría",
      `¿Estás seguro de que deseas eliminar la categoría "${cat.nombre}"? Esto podría eliminar los temas dentro de ella.`,
      true
    );
    if (confirmacion) {
      const id = cat.identificador || cat.id;
      this.foroService.deleteCategoria(id).subscribe({
        next: () => {
          this.categorias = this.categorias.filter(c => (c.identificador || c.id) !== id);
          if (this.categoriaActiva && (this.categoriaActiva.identificador || this.categoriaActiva.id) === id) {
            this.categoriaActiva = null;
          }
          this.foroService.clearCache();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al borrar la categoría", err);
          this.toastService.error("Error al borrar la categoría. Podría tener temas dentro.");
        }
      });
    }
  }

  async editarCategoria(cat: any, event: Event) {
    event.stopPropagation();
    const data = await this.modalService.prompt("Editar Categoría", [
      { name: 'nombre', label: 'Nombre de la Categoría', type: 'text', value: cat.nombre }
    ]);

    if (data && data.nombre?.trim()) {
      const id = cat.identificador || cat.id;
      this.foroService.editCategoria(id, data.nombre).subscribe({
        next: (res) => {
          cat.nombre = data.nombre;
          this.foroService.clearCache();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al editar la categoría", err);
          this.toastService.error("Error al editar la categoría.");
        }
      });
    }
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
      { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: '¿De qué trata este tema?' }
    ]);

    if (data && data.titulo?.trim()) {
      const nuevoTema = {
        titulo: data.titulo.trim(),
        descripcion: (data.descripcion || '').trim(),
        slug: this.generarSlug(data.titulo.trim()),
        categoria: { identificador: this.categoriaActiva.identificador || this.categoriaActiva.id },
        usuario: { identificador: usuarioActual.identificador || usuarioActual.id }
      };

      this.foroService.createTema(nuevoTema).subscribe({
        next: (res) => {
          this.toastService.success("¡Tema creado con éxito!");
          this.foroService.clearCache();
          this.cargarDatosIniciales();
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
}