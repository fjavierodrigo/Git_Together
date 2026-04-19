import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../services/usuario';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginData = { identificador: '', password: '' };
  errorMessage = '';

  /*private cdr: ChangeDetectorRef -> Dependencia para que Angular actualice la vista sin necesidad de interaccion del usuario al detectar cambios en los datos*/
  constructor(private apiUsuario: Usuario, private router: Router, private cdr: ChangeDetectorRef, private toastService: ToastService) { }

  // Se ejecuta al enviar el formulario
  onLogin(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    // Ahora enviamos loginData que contiene { identificador, password }
    this.apiUsuario.login(this.loginData).subscribe({
      next: (res) => {
        console.log("Login exitoso", res);

        // IMPORTANTE: En el Backend devolvemos un LoginResponse que tiene { token, usuario }
        // Guardamos el objeto usuario que viene dentro de la respuesta
        if (res && res.usuario) {
          localStorage.setItem('usuarioLogueado', JSON.stringify(res.usuario));
          this.toastService.success(`¡Hola de nuevo, ${res.usuario.nombre}!`);
        }

        // Navegamos hacia la página principal del foro
        this.router.navigate(['/foro']);
      },
      error: (err) => {
        console.error("Error en el login:", err);
        this.errorMessage = "Usuario o contraseña incorrectos";
        this.loginData.password = ''; // Vaciar el campo de la contraseña al fallar
        this.cdr.detectChanges(); // Forzar la actualización visual automática
      }
    });
  }

  // Navegar a la página de registro
  goToRegister() {
    this.router.navigate(['/register']);
  }
}