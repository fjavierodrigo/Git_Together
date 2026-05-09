import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBaseUrl } from '../../config';

@Injectable({
  providedIn: 'root'
})
export class BaneoService {
  private API_URL = `${getApiBaseUrl()}/api/baneos`;
  private http = inject(HttpClient);

  aplicarBaneo(baneoData: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/aplicar`, baneoData);
  }

  obtenerBaneos(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  eliminarBaneo(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  actualizarBaneo(id: number, baneo: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, baneo);
  }

  reclamar(usuarioId: number, mensaje: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reclamar`, { usuarioId, mensaje });
  }

  obtenerReclamaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/reclamaciones`);
  }

  revisarReclamacion(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/revisar/${id}`, {});
  }
}
