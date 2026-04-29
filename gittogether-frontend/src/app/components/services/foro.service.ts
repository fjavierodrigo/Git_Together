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
    private API_TAGS = 'http://localhost:8080/api/tags';

    private temasCache$: Observable<any[]> | null = null;
    private categoriasCache$: Observable<any[]> | null = null;
    private tagsCache$: Observable<any[]> | null = null;

    // Para acceso instantáneo
    private lastCategorias: any[] = [];
    private lastTags: any[] = [];

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
            this.categoriasCache$.subscribe(data => this.lastCategorias = data);
        }
        return this.categoriasCache$;
    }

    getCategoriasCache(): any[] {
        return this.lastCategorias;
    }

    getTemasPorCategoria(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_TEMAS}/categoria/${id}`);
    }

    getTags(forceRefresh = false): Observable<any[]> {
        if (!this.tagsCache$ || forceRefresh) {
            this.tagsCache$ = this.http.get<any[]>(this.API_TAGS).pipe(
                shareReplay(1)
            );
            this.tagsCache$.subscribe(data => this.lastTags = data);
        }
        return this.tagsCache$;
    }

    getTagsCache(): any[] {
        return this.lastTags;
    }

    getTemasPorTag(nombre: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_TEMAS}/tag/${nombre}`);
    }

    getTemasRelacionados(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_TEMAS}/${id}/relacionados`);
    }

    // --- NUEVOS MÉTODOS PARA RBAC (EDITAR/ELIMINAR) ---

    // Mensajes
    deleteMensaje(id: number): Observable<any> {
        return this.http.delete(`${this.API_MENSAJES}/${id}`);
    }

    editMensaje(id: number, contenido: string): Observable<any> {
        // Asumiendo que el backend espera un objeto con el contenido actualizado
        return this.http.put(`${this.API_MENSAJES}/${id}`, { contenido });
    }

    createMensaje(mensaje: any): Observable<any> {
        return this.http.post(`${this.API_MENSAJES}/registrar`, mensaje);
    }

    // Temas
    deleteTema(id: number): Observable<any> {
        return this.http.delete(`${this.API_TEMAS}/${id}`);
    }

    editTema(id: number, titulo?: string, descripcion?: string): Observable<any> {
        return this.http.put(`${this.API_TEMAS}/${id}`, { titulo, descripcion });
    }

    createTema(tema: any): Observable<any> {
        return this.http.post(this.API_TEMAS, tema);
    }

    // Categorías
    deleteCategoria(id: number): Observable<any> {
        return this.http.delete(`${this.API_CATEGORIAS}/${id}`);
    }

    editCategoria(id: number, nombre: string): Observable<any> {
        return this.http.put(`${this.API_CATEGORIAS}/${id}`, { nombre });
    }

    // Método para limpiar la caché si es necesario obligar a refrescar
    clearCache() {
        this.temasCache$ = null;
        this.categoriasCache$ = null;
    }
}