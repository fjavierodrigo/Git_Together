import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Usuario } from '../services/usuario';
import { ThemeService } from '../../services/theme.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private themeService = inject(ThemeService);
  isDarkTheme$ = this.themeService.isDarkTheme$;
  
  usuarioLogueado: any = null;
  imageError: boolean = false;

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

  onLogout() {
    this.apiUsuario.logout();
    this.router.navigate(['/login']);
  }
}
