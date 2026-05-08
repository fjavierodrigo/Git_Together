import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Usuario } from '../services/usuario';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  usuarioLogueado: any = null;
  usuarioVisualizado: any = null;
  esPropioPerfil: boolean = false;
  stats: any = { numComentarios: 0, numPost: 0, fechaRegistro: '' };
  avatarPreview: any = null;
  imageError: boolean = false;

  constructor(
    private usuarioService: Usuario, 
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer
  ) {}

  getInitials(): string {
    if (!this.usuarioVisualizado?.nombre) return '??';
    return this.usuarioVisualizado.nombre
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarUrl(): SafeUrl | string | null {
    return this.usuarioService.getAvatarUrl(this.usuarioVisualizado?.avatar);
  }

  handleImageError() {
    const url = this.usuarioVisualizado?.avatar;
    console.error("ERROR: No se pudo cargar la imagen. Revisa si esta URL es pública y correcta:", url);
    this.imageError = true;
    this.cdr.detectChanges();
  }

  goToForo() {
    this.router.navigate(['/foro']);
  }

  abrirSelectorArchivo(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  ngOnInit() {
    this.usuarioService.currentUser$.subscribe(user => {
      this.usuarioLogueado = user;
      this.verificarYSubscribirARuta();
    });
  }

  private verificarYSubscribirARuta() {
    this.route.params.subscribe(params => {
      const idParam = params['id'];
      if (idParam) {
        this.cargarUsuario(Number(idParam));
      } else if (this.usuarioLogueado) {
        this.establecerPerfilPropio();
      }
    });
  }

  private cargarUsuario(id: number) {
    const loggedId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
    if (loggedId === id) {
      this.establecerPerfilPropio();
      return;
    }

    this.usuarioService.obtenerPorId(id).subscribe({
      next: (user) => {
        this.usuarioVisualizado = user;
        this.esPropioPerfil = false;
        this.imageError = false;
        this.cargarStats(id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.toastService.error("No se pudo encontrar el usuario.");
        this.router.navigate(['/foro']);
      }
    });
  }

  private establecerPerfilPropio() {
    this.usuarioVisualizado = this.usuarioLogueado;
    this.esPropioPerfil = true;
    this.imageError = false;
    const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
    if (userId) {
      this.cargarStats(userId);
    }
    this.cdr.detectChanges();
  }

  private statsLoaded = false;
  private cargarStats(userId: number) {
    this.usuarioService.getStats(userId).subscribe({
      next: (data) => {
        if (data) {
          this.stats = data;
          this.statsLoaded = true;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error stats:', err)
    });
  }

  async editarPerfil() {
    const data = await this.modalService.prompt("Editar Perfil", [
      { 
        name: 'descripcion', 
        label: 'Sobre mí', 
        type: 'textarea', 
        value: this.usuarioLogueado?.descripcion || '' 
      }
    ]);

    if (data && data.descripcion !== undefined) {
      const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
      this.usuarioService.updatePerfil(userId, { descripcion: data.descripcion }).subscribe({
        next: (usuarioActualizado) => {
          this.usuarioLogueado = usuarioActualizado;
          this.toastService.success("Perfil actualizado correctamente");
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al actualizar el perfil", err);
          this.toastService.error("No se pudo actualizar el perfil.");
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        this.toastService.error("La imagen es demasiado grande (máx 1MB)");
        return;
      }

      // Mostramos preview local mientras se sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      // Subimos el archivo real
      this.actualizarAvatar(file);
    }
  }

  actualizarAvatar(archivo: File) {
    const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
    // Mandamos el objeto de datos vacío o con lo que queramos, y el archivo aparte
    this.usuarioService.updatePerfil(userId, {}, archivo).subscribe({
      next: (usuarioActualizado) => {
        this.toastService.success("Foto de perfil actualizada");
        this.avatarPreview = null; // Limpiamos la preview para usar la URL real
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al subir el avatar", err);
        this.toastService.error("No se pudo actualizar la foto de perfil.");
        this.avatarPreview = null; // Reset preview on error
      }
    });
  }

  async eliminarAvatar() {
    const confirmacion = await this.modalService.confirm(
      "Eliminar foto",
      "¿Estás seguro de que deseas eliminar tu foto de perfil?",
      true
    );

    if (confirmacion) {
      const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
      // Enviamos "null" como string para que el backend sepa que queremos borrarlo
      this.usuarioService.updatePerfil(userId, { avatar: "null" }).subscribe({
        next: (usuarioActualizado) => {
          this.toastService.success("Foto de perfil eliminada");
          this.imageError = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al eliminar el avatar", err);
          this.toastService.error("No se pudo eliminar la foto.");
        }
      });
    }
  }
}
