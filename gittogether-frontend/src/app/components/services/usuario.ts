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
        // Si el backend devuelve un token, lo guardamos en el almacenamiento local del navegador
        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
        }
      })
    );
  }

  // Recupera el token guardado para enviarlo en las cabeceras HTTP
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Elimina el token para cerrar la sesión del usuario
  logout(): void {
    localStorage.removeItem('auth_token');
  }
}