import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Usuario {
  // URL base del backend para las peticiones relacionadas con usuarios
  private API_URL = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

  // Realiza la petición de login y almacena el token JWT si la respuesta es exitosa
  login(datos: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, datos).pipe(
      tap(response => {
        // Guardamos el token en local storage
        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
          // Guardamos los datos del usuario para el perfil
          localStorage.setItem('usuarioLogueado', JSON.stringify(response.usuario));
        }
      })
    );
  }

  // Realiza la petición de registro
  register(datos: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, datos);
  }

  // Recupera el token guardado para enviarlo en las cabeceras HTTP
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Elimina el caché del navegador
  logout() {
    localStorage.clear()
  }

  // Obtiene el usuario actualmente logueado desde localStorage
  getUsuarioLogueado(): any {
    const userStr = localStorage.getItem('usuarioLogueado');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Comprueba si el usuario logueado es Administrador
  esAdmin(): boolean {
    const user = this.getUsuarioLogueado();
    return user && user.rol === 'Admin';
  }

  // Comprueba si el usuario logueado es Moderador
  esModerador(): boolean {
    const user = this.getUsuarioLogueado();
    return user && user.rol === 'Moderador';
  }

  // Comprueba si el usuario logueado es el autor del contenido
  esAutor(idAutor: number): boolean {
    const user = this.getUsuarioLogueado();
    return user && user.identificador === idAutor;
  }
}