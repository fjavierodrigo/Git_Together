import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../services/usuario';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginData = { nombre: '', password: '' }; // Modelo vinculado al formulario
  errorMessage = ''; // Variable para mostrar errores en el HTML

  constructor(private apiUsuario: Usuario, private router: Router) { } 

  // Se ejecuta al enviar el formulario
  onLogin(event: Event) {
    event.preventDefault();
    
    this.apiUsuario.login(this.loginData).subscribe({
      next: (res) => {
        console.log("Login exitoso", res);
        // Guardamos información adicional del usuario (opcional)
        localStorage.setItem('usuarioLogueado', JSON.stringify(res));
        
        // Navegamos hacia la página principal del foro
        this.router.navigate(['/foro']);
      },
      error: (err) => {
        // Manejamos el error si las credenciales son inválidas
        this.errorMessage = "Datos incorrectos";
      }
    });
  }
}