import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Usuario } from '../services/usuario';
import { BaneoService } from '../services/baneo.service';
import { NavbarComponent } from '../navbar/navbar';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css'
})
export class AdminUsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router); // Inyectamos Router
  public usuarioService: Usuario = inject(Usuario);
  private baneoService = inject(BaneoService);
  private toastService: ToastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  baneos: any[] = [];
  reclamaciones: any[] = [];
  
  usuarioSeleccionado: any = null;
  baneoSeleccionado: any = null; // Para editar baneos
  usuarioLogueado: any = null; // Propiedad añadida para corregir el error
  
  mostrarModal: boolean = false;
  mostrarModalEditarBaneo: boolean = false;
  mostrarModalConfirmarDesbanear: boolean = false;
  baneoParaDesbanearId: number | null = null;

  activeTab: 'ACTIVOS' | 'BANEADOS' | 'RECLAMACIONES' = 'ACTIVOS';
  searchQuery: string = '';
  menuAbiertoId: number | null = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Si el clic no es dentro de un botón de acciones ni dentro del menú, cerramos
    if (!target.closest('.btn-actions') && !target.closest('.action-menu')) {
      this.menuAbiertoId = null;
    }
  }

  // Datos para el baneo
  razon: string = '';
  evidencia: string = '';
  fechaFin: string = '';
  minFecha: string = '';
  archivosEvidencia: File[] = [];

  constructor() {}

  onArchivosEvidencia(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files) as File[];
      this.archivosEvidencia = [...this.archivosEvidencia, ...files];
    }
  }

  removerArchivoEvidencia(index: number) {
    this.archivosEvidencia.splice(index, 1);
  }

  ngOnInit() {
    console.log('AdminUsuariosComponent cargado correctamente');
    this.usuarioLogueado = this.usuarioService.getUsuarioLogueado();
    
    // Restaurar pestaña desde localStorage si existe
    const savedTab = localStorage.getItem('adminActiveTab') as any;
    if (savedTab && ['ACTIVOS', 'BANEADOS', 'RECLAMACIONES'].includes(savedTab)) {
      this.activeTab = savedTab;
    }

    this.cargarDatos();
    this.calcularMinFecha();
  }

  calcularMinFecha() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minFecha = tomorrow.toISOString().split('T')[0];
  }

  volverAlForo() {
    this.router.navigate(['/foro']);
  }

  cargarDatos() {
    // Cargamos usuarios y baneos juntos para la primera carga y asegurar filtros correctos
    forkJoin({
      usuarios: this.usuarioService.obtenerTodos(),
      baneos: this.baneoService.obtenerBaneos()
    }).subscribe({
      next: (res) => {
        this.usuarios = (res.usuarios || []).map((u: any) => ({ ...u, avatarError: false }));
        this.baneos = (res.baneos || []).map((b: any) => ({
          ...b,
          usuario: { ...b.usuario, avatarError: false }
        }));
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando datos de administración", err);
      }
    });

    this.cargarReclamaciones();
  }

  cargarUsuarios() {
    this.usuarioService.obtenerTodos().subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.usuarios = data.map(u => ({ ...u, avatarError: false }));
          this.aplicarFiltros();
          this.cdr.detectChanges();
        }
      }
    });
  }

  cargarBaneos() {
    this.baneoService.obtenerBaneos().subscribe({
      next: (data: any[]) => {
        this.baneos = (data || []).map((b: any) => ({
          ...b,
          usuario: { ...b.usuario, avatarError: false }
        }));
        this.aplicarFiltros();
        this.cdr.detectChanges();
      }
    });
  }

  cargarReclamaciones() {
    this.http.get<any[]>('http://localhost:8080/api/baneos/reclamaciones').subscribe({
      next: (data) => {
        this.reclamaciones = data;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'ACTIVOS' | 'BANEADOS' | 'RECLAMACIONES') {
    this.activeTab = tab;
    localStorage.setItem('adminActiveTab', tab);
    this.searchQuery = '';
    this.menuAbiertoId = null;
    this.aplicarFiltros();
    this.cdr.detectChanges();
  }

  toggleMenu(id: number) {
    this.menuAbiertoId = this.menuAbiertoId === id ? null : id;
  }

  onSearch() {
    this.aplicarFiltros();
    this.cdr.detectChanges();
  }

  aplicarFiltros() {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (this.activeTab === 'ACTIVOS') {
      // Filtrar usuarios que NO están en la lista de baneos activos
      const idsBaneados = this.baneos.map(b => b.usuario.identificador);
      this.usuariosFiltrados = this.usuarios.filter(u => 
        !idsBaneados.includes(u.identificador) && 
        (u.nombre.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      );
    } else if (this.activeTab === 'BANEADOS') {
      this.usuariosFiltrados = this.baneos.filter(b => 
        b.usuario.nombre.toLowerCase().includes(query) || b.usuario.email.toLowerCase().includes(query)
      );
    }
  }

  desbanear(id: number) {
    this.baneoParaDesbanearId = id;
    this.mostrarModalConfirmarDesbanear = true;
    this.menuAbiertoId = null;
  }

  confirmarDesbanear() {
    if (this.baneoParaDesbanearId) {
      this.mostrarModalConfirmarDesbanear = false;
      this.http.delete(`http://localhost:8080/api/baneos/${this.baneoParaDesbanearId}`).subscribe({
        next: () => {
          this.toastService.success('Usuario desbaneado correctamente');
          this.baneoParaDesbanearId = null;
          this.cargarDatos();
        },
        error: () => {
          this.toastService.error('Error al desbanear usuario');
          this.cargarDatos(); // Refrescar igual por si acaso
        }
      });
    }
  }

  abrirEditarBaneo(baneo: any) {
    this.baneoSeleccionado = { ...baneo };
    this.mostrarModalEditarBaneo = true;
    this.menuAbiertoId = null; // Cerrar el menú al abrir el modal
  }

  guardarEdicionBaneo() {
    this.mostrarModalEditarBaneo = false; // Cierre inmediato
    this.http.put(`http://localhost:8080/api/baneos/${this.baneoSeleccionado.identificador}`, this.baneoSeleccionado).subscribe({
      next: () => {
        this.toastService.success('Baneo actualizado correctamente');
        this.cargarDatos(); // Actualización reactiva
      },
      error: () => {
        this.toastService.error('Error al actualizar el baneo');
      }
    });
  }

  revisarReclamacion(reclamacion: any) {
    this.http.post(`http://localhost:8080/api/baneos/revisar/${reclamacion.identificador}`, {}).subscribe({
      next: () => {
        this.toastService.success('Reclamación marcada como revisada');
        this.cargarReclamaciones();
      },
      error: () => {
        this.toastService.error('Error al marcar como revisada');
      }
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    return nombre.charAt(0).toUpperCase();
  }

  handleImageError(u: any) {
    u.avatarError = true;
  }

  abrirModalBaneo(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.razon = '';
    this.evidencia = '';
    this.fechaFin = '';
    this.archivosEvidencia = [];
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
    this.archivosEvidencia = [];
  }

  confirmarBaneo() {
    if (!this.razon || !this.razon.trim()) return;
    const adminLogueado = this.usuarioLogueado;
    const baneo = {
      razon: this.razon,
      evidencia: this.evidencia,
      fechaFin: this.fechaFin || null,
      baneadoPor: adminLogueado ? adminLogueado.nombre : 'ADMIN',
      usuario: { identificador: this.usuarioSeleccionado.identificador }
    };

    const formData = new FormData();
    // Enviamos el objeto baneo como un Blob con tipo application/json para que Spring lo reconozca
    const baneoBlob = new Blob([JSON.stringify(baneo)], { type: 'application/json' });
    formData.append('baneo', baneoBlob);
    this.archivosEvidencia.forEach(file => formData.append('archivos', file));

    const nombreUsuario = this.usuarioSeleccionado?.nombre || 'Usuario';
    this.cerrarModal(); 

    this.baneoService.aplicarBaneo(formData).subscribe({
      next: () => {
        this.toastService.success(`Usuario ${nombreUsuario} baneado correctamente`);
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al banear:', err);
        this.toastService.error('Error al aplicar el baneo');
        this.cargarDatos();
      }
    });
  }
}
