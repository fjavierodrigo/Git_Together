import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForoService } from '../services/foro.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../services/usuario';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-categoria-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categoria-sidebar.html',
  styleUrl: './categoria-sidebar.css'
})
export class CategoriaSidebar implements OnInit {
  @Input() categorias: any[] = [];
  @Input() tags: any[] = [];
  @Input() activeCategorySlug: string | null = null;
  @Input() activeTagId: number | null = null;

  @Output() categorySelected = new EventEmitter<any>();
  @Output() tagSelected = new EventEmitter<any>();

  activeMenuId: string | number | null = null;

  toggleMenu(id: string | number, event: Event) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  constructor(
    private foroService: ForoService,
    private route: ActivatedRoute,
    private router: Router,
    public usuarioService: Usuario,
    private modalService: ModalService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Escuchamos los cambios en los queryParams para activar la categoría correcta
    this.route.queryParams.subscribe(params => {
      if (params['cat']) {
        this.activeCategorySlug = params['cat'];
      }
    });
  }

  // Cerrar menús al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.activeMenuId = null;
  }

  onCategoryClick(cat: any) {
    if (this.activeCategorySlug === cat.slug) {
      this.activeCategorySlug = null;
      this.router.navigate(['/foro'], { queryParams: {} });
    } else {
      this.activeCategorySlug = cat.slug;
      this.router.navigate(['/foro'], { queryParams: { cat: cat.slug } });
    }
    this.categorySelected.emit(this.activeCategorySlug);
  }

  onTagClick(tag: any) {
    if (this.activeTagId === tag.identificador) {
      this.activeTagId = null;
    } else {
      this.activeTagId = tag.identificador;
      this.activeCategorySlug = null;
    }
    this.tagSelected.emit(tag);
  }

  // --- MÉTODOS ADMIN (Copiados de foro.ts para mantener funcionalidad) ---
  async borrarCategoria(cat: any, event: Event) {
    event.stopPropagation();
    const confirmacion = await this.modalService.confirm(
      "Eliminar Categoría",
      `¿Estás seguro de que deseas eliminar la categoría "${cat.nombre}"?`,
      true
    );
    if (confirmacion) {
      this.foroService.deleteCategoria(cat.identificador || cat.id).subscribe({
        next: () => {
          this.categorias = this.categorias.filter(c => (c.identificador || c.id) !== (cat.identificador || cat.id));
          this.foroService.clearCache();
        },
        error: (err) => this.toastService.error("No se pudo borrar la categoría")
      });
    }
  }

  async editarCategoria(cat: any, event: Event) {
    event.stopPropagation();
    const data = await this.modalService.prompt("Editar Categoría", [
      { name: 'nombre', label: 'Nombre', type: 'text', value: cat.nombre }
    ]);
    if (data && data.nombre?.trim()) {
      this.foroService.editCategoria(cat.identificador || cat.id, data.nombre).subscribe({
        next: () => {
          cat.nombre = data.nombre;
          this.foroService.clearCache();
        }
      });
    }
  }
}
