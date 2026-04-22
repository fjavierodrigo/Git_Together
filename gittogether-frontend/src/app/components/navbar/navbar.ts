import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Usuario } from '../services/usuario';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  usuarioLogueado: any = null;
  imageError: boolean = false;

  constructor(
    private apiUsuario: Usuario, 
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

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
    const url = this.usuarioLogueado?.avatar;
    if (!url || this.imageError) return null;
    return this.sanitizer.bypassSecurityTrustUrl(encodeURI(url.trim()));
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
