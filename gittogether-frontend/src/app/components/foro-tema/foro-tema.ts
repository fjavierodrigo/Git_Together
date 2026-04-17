import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ForoService } from '../services/foro.service';
import { NavbarComponent } from '../navbar/navbar';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-foro-tema',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './foro-tema.html',
  styleUrl: './foro-tema.css'
})
export class ForoTema implements OnInit {
  temaSlug: string | null = null;
  tema: any = null;
  mensajes: any[] = [];
  cargando: boolean = true;
  skeletonMensajes = Array(3).fill(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private foroService: ForoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.temaSlug = this.route.snapshot.paramMap.get('slug');
    if (this.temaSlug) {
      this.cargarDatos();
    } else {
      this.router.navigate(['/foro']);
    }
  }

  cargarDatos(): void {
    if (!this.temaSlug) return;

    this.tema = null;
    this.mensajes = [];

    // SWR Pattern: Intentar cargar del caché primero para carga instantánea
    const cacheKey = `tema_slug_${this.temaSlug}_cache`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      this.tema = parsed.tema;
      this.mensajes = parsed.mensajes;
      this.cargando = false;
    } else {
      this.cargando = true;
    }

    // Primero obtenemos el tema por slug, y luego sus mensajes usando su ID real
    this.foroService.getTemaBySlug(this.temaSlug).pipe(
      switchMap(temaRes => {
        this.tema = temaRes;
        if (temaRes && (temaRes.identificador || temaRes.id)) {
          const id = temaRes.identificador || temaRes.id;
          return this.foroService.getMensajesPorTema(id);
        }
        return of([]);
      })
    ).subscribe({
      next: (mensajesRes) => {
        this.mensajes = mensajesRes;
        
        // Guardar en caché para la próxima vez
        localStorage.setItem(cacheKey, JSON.stringify({
          tema: this.tema,
          mensajes: this.mensajes
        }));
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando el tema o mensajes", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/foro']);
  }
}
