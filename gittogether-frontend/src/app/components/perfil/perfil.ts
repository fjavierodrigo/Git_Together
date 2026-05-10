import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Usuario } from "../services/usuario";
import { ForoService } from '../services/foro.service';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BaneoService } from '../services/baneo.service';

import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, MarkdownModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {


  usuarioLogueado: any = null;
  usuarioVisualizado: any = null;
  esPropioPerfil: boolean = false;
  stats: any = { numComentarios: 0, numPost: 0, fechaRegistro: '' };
  avatarPreview: any = null;
  imageError: boolean = false;
  estaBaneado: boolean = false;



  // Fase 2: Pestañas y Listas
  activeTab: 'info' | 'temas' | 'mensajes' = 'info';
  temasUsuario: any[] = [];
  mensajesUsuario: any[] = [];
  cargandoTemas: boolean = false;
  cargandoMensajes: boolean = false;

  constructor(
    private usuarioService: Usuario,
    private router: Router,
    private route: ActivatedRoute,
    private foroService: ForoService,
    private cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private baneoService: BaneoService
  ) { }



  getInitials(): string {
    if (!this.usuarioVisualizado?.nombre) return '??';
    return this.usuarioVisualizado.nombre
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarUrl(): SafeUrl | string | null {
    return this.usuarioService.getAvatarUrl(this.usuarioVisualizado?.avatar);
  }

  handleImageError() {
    const url = this.usuarioVisualizado?.avatar;
    console.error("ERROR: No se pudo cargar la imagen. Revisa si esta URL es pública y correcta:", url);
    this.imageError = true;
    this.cdr.detectChanges();
  }



  abrirSelectorArchivo(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  ngOnInit() {
    this.usuarioService.currentUser$.subscribe(user => {
      this.usuarioLogueado = user;
      if (user) {
        this.verificarEstadoBaneo();
      }
    });

    this.route.params.subscribe(params => {
      const idStr = params['id'];
      
      // Intentar pillar datos básicos del router state (pasados desde el foro)
      const navigation = this.router.getCurrentNavigation();
      const stateUser = history.state?.user;
      if (stateUser && idStr && (stateUser.identificador || stateUser.id) == idStr) {
        this.usuarioVisualizado = stateUser;
        this.imageError = false;
        this.cdr.detectChanges();
      }

      if (idStr) {
        const id = parseInt(idStr, 10);
        this.cargarUsuario(id);
      } else if (this.usuarioLogueado) {
        this.establecerPerfilPropio();
      }
    });
  }

  private cargarUsuario(id: number) {
    const loggedId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
    if (loggedId === id) {
      this.establecerPerfilPropio();
      return;
    }

    // 1. Intentar cargar desde caché para visualización instantánea
    const cacheKey = `perfil_user_${id}`;
    const cachedUser = sessionStorage.getItem(cacheKey);
    if (cachedUser) {
      this.usuarioVisualizado = JSON.parse(cachedUser);
      this.esPropioPerfil = false;
      this.imageError = false;
      this.cdr.detectChanges();
    }

    // 2. Cargar de la API para asegurar datos frescos
    this.usuarioService.obtenerPorId(id).subscribe({
      next: (user) => {
        this.usuarioVisualizado = user;
        this.esPropioPerfil = false;
        this.imageError = false;
        
        // Guardar en caché para la próxima vez
        sessionStorage.setItem(cacheKey, JSON.stringify(user));
        
        this.cargarStats(id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        if (!this.usuarioVisualizado) {
          this.toastService.error("No se pudo encontrar el usuario.");
          this.router.navigate(['/foro']);
        }
      }
    });
  }

  private establecerPerfilPropio() {
    this.usuarioVisualizado = this.usuarioLogueado;
    this.esPropioPerfil = true;
    this.imageError = false;
    const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
    if (userId) {
      this.cargarStats(userId);
    }
    this.cdr.detectChanges();
  }

  private verificarEstadoBaneo() {
    this.baneoService.obtenerBaneos().subscribe(baneos => {
      if (!this.usuarioLogueado) return;
      const loggedId = this.usuarioLogueado.identificador || this.usuarioLogueado.id;
      const miBaneo = baneos.find(b => b.usuario && (b.usuario.identificador === loggedId || b.usuario.id === loggedId));
      this.estaBaneado = !!miBaneo;
      this.cdr.detectChanges();
    });
  }

  private statsLoaded = false;
  private cargarStats(userId: number) {
    const cacheKey = `perfil_stats_${userId}`;
    const cachedStats = sessionStorage.getItem(cacheKey);
    if (cachedStats) {
      this.stats = JSON.parse(cachedStats);
      this.statsLoaded = true;
      this.cdr.detectChanges();
    }

    this.usuarioService.getStats(userId).subscribe({
      next: (data) => {
        if (data) {
          this.stats = data;
          this.statsLoaded = true;
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error stats:', err)
    });
  }

  // --- FASE 2: GESTIÓN DE PESTAÑAS ---

  setTab(tab: 'info' | 'temas' | 'mensajes') {
    this.activeTab = tab;
    const userId = this.usuarioVisualizado?.identificador || this.usuarioVisualizado?.id;
    
    if (tab === 'temas' && this.temasUsuario.length === 0) {
      this.cargarTemasUsuario(userId);
    } else if (tab === 'mensajes' && this.mensajesUsuario.length === 0) {
      this.cargarMensajesUsuario(userId);
    }
    
    this.cdr.detectChanges();
  }

  private cargarTemasUsuario(userId: number) {
    if (!userId) return;
    this.cargandoTemas = true;
    
    // SWR: Intentar cargar de caché
    const cacheKey = `perfil_temas_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      this.temasUsuario = JSON.parse(cached);
      this.cargandoTemas = false;
    }

    this.foroService.getTemasPorUsuario(userId).subscribe({
      next: (temas) => {
        this.temasUsuario = temas;
        sessionStorage.setItem(cacheKey, JSON.stringify(temas));
        this.cargandoTemas = false;
        this.cdr.detectChanges();
      },
      error: () => this.cargandoTemas = false
    });
  }

  private cargarMensajesUsuario(userId: number) {
    if (!userId) return;
    this.cargandoMensajes = true;

    // SWR: Intentar cargar de caché
    const cacheKey = `perfil_mensajes_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      this.mensajesUsuario = JSON.parse(cached);
      this.cargandoMensajes = false;
    }

    this.foroService.getMensajesPorUsuario(userId).subscribe({
      next: (mensajes) => {
        this.mensajesUsuario = mensajes;
        sessionStorage.setItem(cacheKey, JSON.stringify(mensajes));
        this.cargandoMensajes = false;
        this.cdr.detectChanges();
      },
      error: () => this.cargandoMensajes = false
    });
  }

  async editarPerfil() {
    const data = await this.modalService.prompt("Editar Perfil", [
      {
        name: 'descripcion',
        label: 'Sobre mí',
        type: 'textarea',
        value: this.usuarioLogueado?.descripcion || '',
        maxlength: 150
      }
    ]);

    if (data && data.descripcion !== undefined) {
      const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
      this.usuarioService.updatePerfil(userId, { descripcion: data.descripcion }).subscribe({
        next: (usuarioActualizado) => {
          this.usuarioLogueado = usuarioActualizado;
          this.usuarioVisualizado = usuarioActualizado;
          
          // Actualizar caché
          sessionStorage.setItem(`perfil_user_${userId}`, JSON.stringify(usuarioActualizado));
          
          this.toastService.success("Perfil actualizado correctamente");
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al actualizar el perfil", err);
          this.toastService.error("No se pudo actualizar el perfil.");
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        this.toastService.error("La imagen es demasiado grande (máx 1MB)");
        return;
      }

      // Mostramos preview local mientras se sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      // Subimos el archivo real
      this.actualizarAvatar(file);
    }
  }

  actualizarAvatar(archivo: File) {
    const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
    // Mandamos el objeto de datos vacío o con lo que queramos, y el archivo aparte
    this.usuarioService.updatePerfil(userId, {}, archivo).subscribe({
      next: (usuarioActualizado) => {
        this.toastService.success("Foto de perfil actualizada");
        this.avatarPreview = null; 
        this.usuarioVisualizado = usuarioActualizado;
        
        // Actualizar caché
        sessionStorage.setItem(`perfil_user_${userId}`, JSON.stringify(usuarioActualizado));
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al subir el avatar", err);
        this.toastService.error("No se pudo actualizar la foto de perfil.");
        this.avatarPreview = null; // Reset preview on error
      }
    });
  }

  async eliminarAvatar() {
    const confirmacion = await this.modalService.confirm(
      "Eliminar foto",
      "¿Estás seguro de que deseas eliminar tu foto de perfil?",
      true
    );

    if (confirmacion) {
      const userId = this.usuarioLogueado?.identificador || this.usuarioLogueado?.id;
      // Enviamos "null" como string para que el backend sepa que queremos borrarlo
      this.usuarioService.updatePerfil(userId, { avatar: "null" }).subscribe({
        next: (usuarioActualizado) => {
          this.toastService.success("Foto de perfil eliminada");
          this.imageError = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al eliminar el avatar", err);
          this.toastService.error("No se pudo eliminar la foto.");
        }
      });
    }
  }
}
