import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { getApiBaseUrl } from '../../config';

@Injectable({
    providedIn: 'root'
})
export class ForoService {
    private API_TEMAS = `${getApiBaseUrl()}/api/temas`;
    private API_CATEGORIAS = `${getApiBaseUrl()}/api/categorias`;
    private API_MENSAJES = `${getApiBaseUrl()}/api/mensajes-foro`;
    private API_TAGS = `${getApiBaseUrl()}/api/tags`;
    private API_ARCHIVOS = `${getApiBaseUrl()}/api/archivos`;
    private API_LIKES = `${getApiBaseUrl()}/api/likes`;

    // BehaviorSubjects para un estado global reactivo e instantáneo
    private temasSubject = new BehaviorSubject<any[]>([]);
    private categoriasSubject = new BehaviorSubject<any[]>([]);
    private tagsSubject = new BehaviorSubject<any[]>([]);

    // Control de tiempo para evitar refrescos constantes
    private ultimaCarga: number = 0;
    private readonly CACHE_TTL = 300000; // 5 minutos en milisegundos

    // Observables públicos
    temas$ = this.temasSubject.asObservable();
    categorias$ = this.categoriasSubject.asObservable();
    tags$ = this.tagsSubject.asObservable();

    constructor(private http: HttpClient) {
        // Intentar cargar de sessionStorage al iniciar el servicio para máxima velocidad
        const cTemas = sessionStorage.getItem('foro_temas_cache');
        const cCats = sessionStorage.getItem('foro_categorias_cache');
        const cTags = sessionStorage.getItem('foro_tags_cache');

        if (cTemas) this.temasSubject.next(JSON.parse(cTemas));
        if (cCats) this.categoriasSubject.next(JSON.parse(cCats));
        if (cTags) this.tagsSubject.next(JSON.parse(cTags));
    }

    // Carga inicial y refresco inteligente
    cargarTodo(): void {
        const ahora = Date.now();
        // Solo refrescamos si la caché tiene más de 5 minutos o no hay datos
        if (ahora - this.ultimaCarga > this.CACHE_TTL || this.temasSubject.value.length === 0) {
            this.getTemas().subscribe();
            this.getCategorias().subscribe();
            this.getTags().subscribe();
            this.ultimaCarga = ahora;
        }
    }

    getTemas(): Observable<any[]> {
        return this.http.get<any[]>(this.API_TEMAS).pipe(
            tap(temas => {
                // Ordenar los tags dentro de cada tema para consistencia
                temas.forEach((tema: any) => {
                    if (tema.tags) {
                        tema.tags.sort((a: any, b: any) => a.tag.nombre.localeCompare(b.tag.nombre));
                    }
                });
                this.temasSubject.next(temas);
                sessionStorage.setItem('foro_temas_cache', JSON.stringify(temas));
            })
        );
    }

    getCategorias(): Observable<any[]> {
        return this.http.get<any[]>(this.API_CATEGORIAS).pipe(
            tap(cats => {
                this.categoriasSubject.next(cats);
                sessionStorage.setItem('foro_categorias_cache', JSON.stringify(cats));
            })
        );
    }

    getTags(): Observable<any[]> {
        return this.http.get<any[]>(this.API_TAGS).pipe(
            tap(tags => {
                // Ordenar alfabéticamente para evitar que cambien de sitio
                const ordenados = [...tags].sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
                this.tagsSubject.next(ordenados);
                sessionStorage.setItem('foro_tags_cache', JSON.stringify(ordenados));
            })
        );
    }

    // Métodos de acceso instantáneo
    getTemasSnapshot() { return this.temasSubject.value; }
    getCategoriasSnapshot() { return this.categoriasSubject.value; }
    getTagsSnapshot() { return this.tagsSubject.value; }

    searchTags(query: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_TAGS}/search?query=${query}`);
    }

    // --- ACCIONES CON ACTUALIZACIÓN INSTANTÁNEA DEL ESTADO ---

    deleteTema(id: number): Observable<any> {
        return this.http.delete(`${this.API_TEMAS}/${id}`).pipe(
            tap(() => {
                const actual = this.temasSubject.value.filter(t => (t.identificador || t.id) !== id);
                this.temasSubject.next(actual);
                sessionStorage.setItem('foro_temas_cache', JSON.stringify(actual));
            })
        );
    }

    createTema(tema: any): Observable<any> {
        return this.http.post(this.API_TEMAS, tema).pipe(
            tap(nuevo => {
                const actual = [nuevo, ...this.temasSubject.value];
                this.temasSubject.next(actual);
                sessionStorage.setItem('foro_temas_cache', JSON.stringify(actual));
            })
        );
    }

    editTema(id: number, titulo?: string, descripcion?: string, tags?: string[]): Observable<any> {
        return this.http.put(`${this.API_TEMAS}/${id}`, { titulo, descripcion, tags }).pipe(
            tap(editado => {
                const actual = this.temasSubject.value.map(t =>
                    (t.identificador || t.id) === id ? { ...t, ...editado } : t
                );
                this.temasSubject.next(actual);
                sessionStorage.setItem('foro_temas_cache', JSON.stringify(actual));
            })
        );
    }

    // --- OTROS MÉTODOS (SIN CAMBIO DE LÓGICA) ---
    getTemaBySlug(slug: string): Observable<any> { return this.http.get<any>(`${this.API_TEMAS}/slug/${slug}`); }
    getMensajesPorTema(id: number): Observable<any[]> { return this.http.get<any[]>(`${this.API_MENSAJES}/tema/${id}`); }
    getTemasPorCategoria(id: number): Observable<any[]> { return this.http.get<any[]>(`${this.API_TEMAS}/categoria/${id}`); }
    getTemasPorTag(nombre: string): Observable<any[]> { return this.http.get<any[]>(`${this.API_TEMAS}/tag/${nombre}`); }
    getTemasRelacionados(id: number): Observable<any[]> { return this.http.get<any[]>(`${this.API_TEMAS}/${id}/relacionados`); }
    getTemasPorUsuario(id: number): Observable<any[]> { return this.http.get<any[]>(`${this.API_TEMAS}/por-usuario/${id}`); }
    getMensajesPorUsuario(id: number): Observable<any[]> { return this.http.get<any[]>(`${this.API_MENSAJES}/por-usuario/${id}`); }

    deleteMensaje(id: number): Observable<any> { return this.http.delete(`${this.API_MENSAJES}/${id}`); }
    editMensaje(id: number, contenido: string): Observable<any> { return this.http.put(`${this.API_MENSAJES}/${id}`, { contenido }); }
    createMensaje(mensaje: any): Observable<any> { return this.http.post(`${this.API_MENSAJES}/registrar`, mensaje); }
    deleteCategoria(id: number): Observable<any> { return this.http.delete(`${this.API_CATEGORIAS}/${id}`); }
    editCategoria(id: number, nombre: string): Observable<any> { return this.http.put(`${this.API_CATEGORIAS}/${id}`, { nombre }); }
    createCategoria(nombre: string): Observable<any> { return this.http.post(this.API_CATEGORIAS, { nombre }); }
    createTag(nombre: string): Observable<any> { return this.http.post(this.API_TAGS, { nombre }); }

    subirArchivoTema(temaId: number, usuarioId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.API_ARCHIVOS}/tema/${temaId}/usuario/${usuarioId}`, formData);
    }

    subirArchivoMensaje(mensajeId: number, usuarioId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.API_ARCHIVOS}/mensaje/${mensajeId}/usuario/${usuarioId}`, formData);
    }

    eliminarArchivo(archivoId: number): Observable<any> { return this.http.delete(`${this.API_ARCHIVOS}/${archivoId}`); }

    // --- LIKES ---
    darLike(like: any): Observable<any> {
        console.log("Enviando POST a:", this.API_LIKES, "con datos:", like);
        return this.http.post(this.API_LIKES, like);
    }

    quitarLike(usuarioId: number, mensajeId: number): Observable<any> {
        return this.http.delete(`${this.API_LIKES}/quitar/usuario/${usuarioId}/mensaje/${mensajeId}`);
    }

    quitarLikeTema(usuarioId: number, temaId: number): Observable<any> {
        return this.http.delete(`${this.API_LIKES}/quitar/usuario/${usuarioId}/tema/${temaId}`);
    }

    getCantidadLikesMensaje(mensajeId: number): Observable<number> {
        return this.http.get<number>(`${this.API_LIKES}/mensaje/${mensajeId}/cantidad`);
    }

    getCantidadLikesTema(temaId: number): Observable<number> {
        return this.http.get<number>(`${this.API_LIKES}/tema/${temaId}/cantidad`);
    }

    comprobarLike(mensajeId: number, usuarioId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.API_LIKES}/mensaje/${mensajeId}/usuario/${usuarioId}`);
    }

    comprobarLikeTema(temaId: number, usuarioId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.API_LIKES}/tema/${temaId}/usuario/${usuarioId}`);
    }

    getLikesUsuarioEnTema(usuarioId: number, temaId: number): Observable<number[]> {
        return this.http.get<number[]>(`${this.API_LIKES}/usuario/${usuarioId}/tema/${temaId}`);
    }

    clearCache() {
        // Ya no es necesario limpiar observables, pero podemos forzar recarga
        this.cargarTodo();
    }

    // Compatibilidad con métodos antiguos que pedían cache manual
    getCategoriasCache() { return this.getCategoriasSnapshot(); }
    getTagsCache() { return this.getTagsSnapshot(); }
}