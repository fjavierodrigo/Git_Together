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
  registerData = {
    nombre: '',
    email: '',
    password: '',
    rol: 'Usuario'
  };

  selectedFile: File | null = null; // Para almacenar el archivo binario real
  avatarPreview: string | null = null; // Para la previsualización en el HTML (base64)
  errorMessage = '';

  constructor(
    private apiUsuario: Usuario,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) { }

  /**
   * Captura el archivo seleccionado del input type="file"
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Validación de tamaño (1MB)
      if (file.size > 1024 * 1024) {
        this.toastService.error("La imagen es demasiado grande (máx 1MB)");
        return;
      }

      this.selectedFile = file; // Guardamos el archivo binario para el FormData

      // Generamos la vista previa para el usuario
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
        this.cdr.detectChanges(); // Forzamos la detección de cambios para mostrar la imagen
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Método principal para enviar el registro al backend
   */
  onRegister(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    // Validaciones básicas antes de enviar
    if (!this.registerData.nombre || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = "Por favor, rellena todos los campos obligatorios.";
      return;
    }

    // Llamamos al servicio pasando los datos del usuario Y el archivo
    this.apiUsuario.register(this.registerData, this.selectedFile).subscribe({
      next: (res) => {
        console.log("Registro exitoso en el servidor:", res);
        this.toastService.success("¡Registro completado! Ya puedes entrar.");
        this.router.navigate(['/login']); // Navegamos al login
      },
      error: (err) => {
        console.error("Error en el registro:", err);

        // Manejo detallado de errores del backend
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = "Error al conectar con el servidor. Inténtalo más tarde.";
        }
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Método para el botón de cancelar o volver
   */
  goToLogin() {
    this.router.navigate(['/login']);
  }
}