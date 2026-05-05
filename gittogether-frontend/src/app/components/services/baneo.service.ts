import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaneoService {
  private API_URL = 'http://localhost:8080/api/baneos';
  private http = inject(HttpClient);

  aplicarBaneo(baneo: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/aplicar`, baneo);
  }

  listarBaneos(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }
}
