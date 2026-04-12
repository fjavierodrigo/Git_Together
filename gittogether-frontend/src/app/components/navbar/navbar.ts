import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Usuario } from '../services/usuario';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  usuarioLogueado: any = null;

  constructor(private apiUsuario: Usuario, private router: Router) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('usuarioLogueado');
    if (userJson) {
      this.usuarioLogueado = JSON.parse(userJson);
    }
  }

  onLogout() {
    this.apiUsuario.logout();
    this.router.navigate(['/login']);
  }
}
