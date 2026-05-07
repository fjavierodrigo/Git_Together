import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../services/usuario';
import { ThemeService } from '../../services/theme.service';
import { BaneoService } from '../services/baneo.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private themeService = inject(ThemeService);
  private baneoService = inject(BaneoService);
  private toastService: ToastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  isDarkTheme$ = this.themeService.isDarkTheme$;
  
  usuarioLogueado: any = null;
  imageError: boolean = false;
  estaBaneado: boolean = false;
  razonBaneo: string = '';
  mostrarModalReclamacion: boolean = false;
  mensajeReclamacion: string = '';

  constructor(
    private apiUsuario: Usuario, 
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  toggleTheme() {
    this.themeService.toggleTheme();
  }


  ngOnInit(): void {
    // Nos suscribimos al usuario para reaccionar a cambios (ej: subir foto)
    this.apiUsuario.currentUser$.subscribe(user => {
      this.usuarioLogueado = user;
      this.imageError = false; // Reseteamos el error si cambia el usuario
      if (user) {
        this.verificarEstadoBaneo();
      }
    });
  }

  verificarEstadoBaneo() {
    this.baneoService.obtenerBaneos().subscribe(baneos => {
      // Si el usuario cierra sesión antes de que llegue la respuesta, salimos
      if (!this.usuarioLogueado) return;

      const miBaneo = baneos.find(b => b.usuario && b.usuario.identificador === this.usuarioLogueado.identificador);
      if (miBaneo) {
        this.estaBaneado = true;
        this.razonBaneo = miBaneo.razon;
      } else {
        this.estaBaneado = false;
      }
    });
  }

  abrirModalReclamacion() {
    this.mostrarModalReclamacion = true;
    this.mensajeReclamacion = '';
  }

  enviarReclamacion() {
    if (!this.mensajeReclamacion.trim()) return;
    
    this.baneoService.reclamar(this.usuarioLogueado.identificador, this.mensajeReclamacion).subscribe({
      next: () => {
        this.toastService.success('Reclamación enviada correctamente. La revisaremos pronto.');
        // Usamos setTimeout para mover el cambio de estado al siguiente ciclo de detección
        // Esto evita el error NG0100 (ExpressionChangedAfterItHasBeenCheckedError)
        setTimeout(() => {
          this.mostrarModalReclamacion = false;
          this.mensajeReclamacion = '';
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => {
        this.toastService.error('Error al enviar la reclamación.');
      }
    });
  }

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
    return this.apiUsuario.getAvatarUrl(this.usuarioLogueado?.avatar);
  }

  handleImageError() {
    this.imageError = true;
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
  }

  goToAdmin() {
    this.router.navigate(['/admin/usuarios']);
  }

  esAdmin(): boolean {
    return this.apiUsuario.esAdmin();
  }

  onLogout() {
    this.apiUsuario.logout();
    this.router.navigate(['/login']);
  }
}
