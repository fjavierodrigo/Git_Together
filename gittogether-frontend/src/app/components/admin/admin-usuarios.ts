import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Usuario } from '../services/usuario';
import { BaneoService } from '../services/baneo.service';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css'
})
export class AdminUsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  public usuarioService = inject(Usuario);
  private baneoService = inject(BaneoService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: any[] = [];
  usuarioSeleccionado: any = null;
  mostrarModal: boolean = false;

  // Datos para el baneo
  razon: string = '';
  evidencia: string = '';
  fechaFin: string = '';
  minFecha: string = '';
  archivosEvidencia: File[] = [];

  constructor(private router: Router) {}

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
    this.cargarUsuarios();
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

  cargarUsuarios() {
    this.usuarioService.obtenerTodos().subscribe({
      next: (data) => {
        console.log('Datos brutos recibidos:', data);
        if (data && Array.isArray(data)) {
          console.log('Admin: Cargados ' + data.length + ' usuarios');
          this.usuarios = data.map(u => ({ ...u, avatarError: false }));
          this.cdr.detectChanges();
          if (data.length === 0) console.warn('Atención: La lista de usuarios ha llegado VACÍA desde el servidor');
        } else {
          console.error('Admin: La respuesta no es un array válido', data);
        }
      },
      error: (err) => {
        console.error('Admin: Error crítico cargando usuarios', err);
        if (err.status === 403) console.error('Error 403: No tienes permisos de Admin para esta petición');
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
    if (!this.razon || !this.razon.trim()) {
      return;
    }

    const adminLogueado = this.usuarioService.getUsuarioLogueado();

    const baneo = {
      razon: this.razon,
      evidencia: this.evidencia,
      fechaFin: this.fechaFin || null,
      baneadoPor: adminLogueado ? adminLogueado.nombre : 'ADMIN',
      usuario: {
        identificador: this.usuarioSeleccionado.identificador
      }
    };

    this.baneoService.aplicarBaneo(baneo).subscribe({
      next: () => {
        alert('Usuario baneado correctamente');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err) => {
        alert('Error al banear: ' + (err.error || err.message));
      }
    });
  }
}
