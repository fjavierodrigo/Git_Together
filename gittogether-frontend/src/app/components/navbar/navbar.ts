import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Usuario } from "../services/usuario";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ThemeService } from '../../services/theme.service';
import { BaneoService } from "../services/baneo.service";
import { ToastService } from '../../services/toast.service';
import { ChatWebSocketService } from '../../services/chat-websocket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private themeService = inject(ThemeService);
  private baneoService = inject(BaneoService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private chatService = inject(ChatWebSocketService);
  isDarkTheme$ = this.themeService.isDarkTheme$;
  unreadCount$ = this.chatService.unreadCount$;
  notifications$ = this.chatService.notifications$;

  usuarioLogueado: any = null;
  imageError: boolean = false;
  estaBaneado: boolean = false;
  razonBaneo: string = '';
  mostrarModalReclamacion: boolean = false;
  mensajeReclamacion: string = '';
  mostrarDropdownChat: boolean = false; 
  mostrarDropdownPerfil: boolean = false; 

  constructor(
    public apiUsuario: Usuario,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onLogout() {
    this.apiUsuario.logout();
    this.router.navigate(['/login']);
    this.mostrarDropdownPerfil = false;
  }

  goToForoTop() {
    this.router.navigate(['/foro']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  esAdmin(): boolean {
    return this.apiUsuario.esAdmin();
  }

  goToAdmin() {
    this.router.navigate(['/admin/usuarios']);
    this.mostrarDropdownPerfil = false;
  }

  toggleDropdownPerfil() {
    this.mostrarDropdownPerfil = !this.mostrarDropdownPerfil;
    this.mostrarDropdownChat = false; 
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
    this.mostrarDropdownPerfil = false;
  }

  goToConversaciones() {
    this.router.navigate(['/chat']);
    this.mostrarDropdownPerfil = false;
  }

  ngOnInit(): void {
    this.apiUsuario.currentUser$.subscribe(user => {
      this.usuarioLogueado = user;
      this.imageError = false; 
      if (user) {
        this.verificarEstadoBaneo();
      }
    });
  }

  verificarEstadoBaneo() {
    this.baneoService.obtenerBaneos().subscribe(baneos => {
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
    this.mostrarDropdownPerfil = false;
  }

  enviarReclamacion() {
    if (!this.mensajeReclamacion.trim()) return;
    this.baneoService.reclamar(this.usuarioLogueado.identificador, this.mensajeReclamacion).subscribe({
      next: () => {
        this.toastService.success('Reclamación enviada correctamente.');
        setTimeout(() => {
          this.mostrarModalReclamacion = false;
          this.mensajeReclamacion = '';
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => this.toastService.error('Error al enviar la reclamación.')
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

  toggleDropdownChat() {
    this.mostrarDropdownChat = !this.mostrarDropdownChat;
  }

  irAlChat(emisorId: number) {
    this.router.navigate(['/chat', emisorId]);
    this.mostrarDropdownChat = false;
    this.chatService.resetUnreadCount();
  }
}
