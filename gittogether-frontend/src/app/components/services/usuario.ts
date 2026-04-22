import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Usuario {
  private API_URL = 'http://localhost:8080/api/usuarios';
  
  // Subject reactivo para que toda la app sepa cuando cambia el usuario
  private currentUserSubject = new BehaviorSubject<any>(this.getUsuarioLogueado());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(datos: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, datos).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
          this.setUsuarioLogueado(response.usuario);
        }
      })
    );
  }

  getStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}/stats`);
  }

  // Ahora acepta datos (JSON) y opcionalmente un archivo (File)
  updatePerfil(id: number, datos: any, archivo: File | null = null): Observable<any> {
    const formData = new FormData();
    const usuarioBlob = new Blob([JSON.stringify(datos)], { type: 'application/json' });
    formData.append('usuario', usuarioBlob);

    if (archivo) {
      formData.append('avatar', archivo);
    }

    return this.http.put<any>(`${this.API_URL}/${id}`, formData).pipe(
      tap(usuarioActualizado => {
        if (usuarioActualizado) {
          this.setUsuarioLogueado(usuarioActualizado);
        }
      })
    );
  }

  register(datos: any, archivo: File | null): Observable<any> {
    const formData = new FormData();
    const usuarioBlob = new Blob([JSON.stringify(datos)], { type: 'application/json' });
    formData.append('usuario', usuarioBlob);

    if (archivo) {
      formData.append('avatar', archivo);
    }

    return this.http.post<any>(`${this.API_URL}/register`, formData);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setUsuarioLogueado(usuario: any) {
    localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
    this.currentUserSubject.next(usuario); // Notificamos el cambio
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.currentUserSubject.next(null);
  }

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

  esAdmin(): boolean {
    const user = this.getUsuarioLogueado();
    return user && user.rol === 'Admin';
  }

  esModerador(): boolean {
    const user = this.getUsuarioLogueado();
    return user && user.rol === 'Moderador';
  }

  esAutor(idAutor: number): boolean {
    const user = this.getUsuarioLogueado();
    return user && user.identificador === idAutor;
  }
}