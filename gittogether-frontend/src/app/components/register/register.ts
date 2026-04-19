import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../services/usuario';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerData = { nombre: '', email: '', password: '' };
  errorMessage = '';

  constructor(private apiUsuario: Usuario, private router: Router, private cdr: ChangeDetectorRef, private toastService: ToastService) { }

  onRegister(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    // Llamamos a la API para registrar
    this.apiUsuario.register(this.registerData).subscribe({
      next: (res) => {
        console.log("Registro exitoso", res);
        this.toastService.success("¡Registro completado! Ya puedes entrar.");
        // Navigate back to login on success
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("Error en el registro:", err);
        // Mostrar el mensaje de error del backend si existe, o uno genérico en su defecto
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = "Error al registrar el usuario. Comprueba tus datos.";
        }
        this.cdr.detectChanges();
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
