import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ForoService {
    private API_TEMAS = 'http://localhost:8080/api/temas';
    private API_CATEGORIAS = 'http://localhost:8080/api/categorias';
    private API_MENSAJES = 'http://localhost:8080/api/mensajes-foro';

    // Variables para almacenar la caché en memoria RAM del navegador
    private temasCache$: Observable<any[]> | null = null;
    private categoriasCache$: Observable<any[]> | null = null;

    constructor(private http: HttpClient) { }

    getTemas(forceRefresh = false): Observable<any[]> {
        if (!this.temasCache$ || forceRefresh) {
            // Guardamos el observable y le decimos que guarde en memoria el último resultado (shareReplay)
            this.temasCache$ = this.http.get<any[]>(this.API_TEMAS).pipe(
                shareReplay(1)
            );
        }
        return this.temasCache$;
    }

    getTema(id: number): Observable<any> {
        return this.http.get<any>(`${this.API_TEMAS}/${id}`);
    }

    getTemaBySlug(slug: string): Observable<any> {
        return this.http.get<any>(`${this.API_TEMAS}/slug/${slug}`);
    }

    getMensajesPorTema(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_MENSAJES}/tema/${id}`);
    }

    getCategorias(forceRefresh = false): Observable<any[]> {
        if (!this.categoriasCache$ || forceRefresh) {
            this.categoriasCache$ = this.http.get<any[]>(this.API_CATEGORIAS).pipe(
                shareReplay(1)
            );
        }
        return this.categoriasCache$;
    }

    getTemasPorCategoria(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_TEMAS}/categoria/${id}`);
    }

    // Método para limpiar la caché si es necesario obligar a refrescar
    clearCache() {
        this.temasCache$ = null;
        this.categoriasCache$ = null;
    }
}