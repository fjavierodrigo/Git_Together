import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // La URL de tu controlador de Spring Boot
  private API_URL = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

  // Este método hace el POST real al Backend
  login(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, datos);
  }
}