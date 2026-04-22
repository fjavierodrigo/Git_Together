import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar';
import { Router } from '@angular/router';
import { Usuario } from '../services/usuario';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  usuarioLogueado: any = null;
  stats: any = { numComentarios: 0, numPost: 0, fechaRegistro: '' };
  avatarPreview: any = null;
  imageError: boolean = false;

  constructor(
    private usuarioService: Usuario, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer
  ) {}

  getInitials(): string {
    if (!this.usuarioLogueado?.nombre) return '??';
    return this.usuarioLogueado.nombre
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarUrl(): SafeUrl | string | null {
    const url = this.usuarioLogueado?.avatar;
    if (!url || this.imageError) return null;
    
    const cleanUrl = encodeURI(url.trim());
    console.log("Intentando cargar avatar desde:", cleanUrl);
    return this.sanitizer.bypassSecurityTrustUrl(cleanUrl);
  }

  handleImageError() {
    const url = this.usuarioLogueado?.avatar;
    console.error("ERROR: No se pudo cargar la imagen. Revisa si esta URL es pública y correcta:", url);
    this.imageError = true;
    this.cdr.detectChanges();
  }

  goToForo() {
    this.router.navigate(['/foro']);
  }

  ngOnInit() {
    this.usuarioService.currentUser$.subscribe(user => {
      this.usuarioLogueado = user;
      this.imageError = false; // Reseteamos el error al cambiar de usuario
      
      const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
      if (userId && !this.statsLoaded) {
        this.cargarStats(userId);
      }
    });
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
        // No hace falta asignar this.usuarioLogueado porque ya estamos suscritos en ngOnInit
      },
      error: (err) => {
        console.error("Error al subir el avatar", err);
        this.toastService.error("No se pudo actualizar la foto de perfil.");
        this.avatarPreview = null; // Reset preview on error
      }
    });
  }
}
