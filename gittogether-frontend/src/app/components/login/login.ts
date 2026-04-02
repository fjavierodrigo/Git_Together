import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario';
import { Router } from '@angular/router'; // <--- 1. Importa el Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginData = { nombre: '', password: '' };
  errorMessage = '';

  // 2. Inyectamos el Router en el constructor
  constructor(private apiUsuario: UsuarioService, private router: Router) { } 

  onLogin(event: Event) {
    event.preventDefault();
    
    this.apiUsuario.login(this.loginData).subscribe({
      next: (res) => {
        console.log("Login exitoso", res);
        // Guardamos al usuario para usar su ID o Nombre en el foro después
        localStorage.setItem('usuarioLogueado', JSON.stringify(res));
        
        // 3. ¡LA MAGIA! Redirigimos a /foro
        this.router.navigate(['/foro']);
      },
      error: (err) => {
        this.errorMessage = "Datos incorrectos";
      }
    });
  }
}