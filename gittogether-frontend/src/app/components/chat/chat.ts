import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
import { ChatWebSocketService } from '../../services/chat-websocket.service';
import { Usuario } from '../services/usuario';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { getApiBaseUrl } from '../../config';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef;

  private chatService = inject(ChatWebSocketService);
  public usuarioService = inject(Usuario);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  mensajes: any[] = [];
  conversaciones: any[] = []; // Nueva lista de chats recientes
  filtroContactos: string = ''; // Texto para filtrar contactos
  nuevoMensaje: string = '';
  receptor: any = null;
  usuarioLogueado: any = null;
  private messageSubscription!: Subscription;

  ngOnInit() {
    this.usuarioLogueado = this.usuarioService.getUsuarioLogueado();
    
    if (!this.usuarioLogueado) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarConversaciones();

    this.route.params.subscribe(params => {
      const receptorId = params['id'];
      if (receptorId) {
        this.chatService.chatActivoId = Number(receptorId);
        this.cargarReceptor(Number(receptorId));
      } else {
        this.chatService.chatActivoId = null;
      }
    });

    this.chatService.resetUnreadCount(); // Limpiamos notificaciones al entrar

    this.messageSubscription = this.chatService.messages$.subscribe(msg => {
      if (msg) {
        console.log('Mensaje recibido por WebSocket:', msg);
        
        // Verificamos IDs (convertimos a número por seguridad)
        const emisorId = Number(msg.emisor.identificador);
        const receptorMsgId = Number(msg.receptor.identificador);
        const miId = Number(this.usuarioLogueado.identificador);
        const chatConId = Number(this.receptor?.identificador);

        if ((emisorId === chatConId && receptorMsgId === miId) || 
            (emisorId === miId && receptorMsgId === chatConId)) {
          
          const existe = this.mensajes.some(m => m.identificador === msg.identificador);
          if (!existe) {
            this.mensajes.push(msg);
            this.cdr.detectChanges(); // Forzamos a Angular a pintar
            setTimeout(() => this.scrollToBottom(), 50); // Pequeño delay para dejar que Angular pinte
          }
        }
      }
    });
  }

  scrollToBottom(): void {
    try {
      const container = this.myScrollContainer.nativeElement;
      // Primer intento inmediato
      container.scrollTop = container.scrollHeight;
      
      // Segundo intento de seguridad tras un breve delay
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
      
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 200);
    } catch(err) { }
  }

  cargarReceptor(id: number) {
    this.usuarioService.obtenerPorId(id).subscribe(user => {
      this.receptor = user;
      this.cdr.detectChanges(); // Angular dibuja la vista y crea el contenedor #scrollMe
      
      // SOLO cuando la vista existe, cargamos los mensajes y hacemos scroll
      this.cargarHistorial(id);
    });
  }

  cargarHistorial(receptorId: number) {
    // Usamos el NUEVO controlador aislado para evitar conflictos
    const url = `${getApiBaseUrl()}/api/chat-completo/historial?usuarioUno=${this.usuarioLogueado.identificador}&usuarioDos=${receptorId}`;
    this.http.get<any[]>(url)
      .subscribe({
        next: (msgs) => {
          this.mensajes = msgs;
          this.cdr.detectChanges();
          
          // Doble seguro de scroll ahora que el DOM existe 100%
          setTimeout(() => this.scrollToBottom(), 50);
          setTimeout(() => this.scrollToBottom(), 200);
        },
        error: (err) => {
          console.error('Error cargando historial:', err);
        }
      });
  }

  cargarConversaciones() {
    const url = `${getApiBaseUrl()}/api/chat-completo/conversaciones?userId=${this.usuarioLogueado.identificador}`;
    this.http.get<any[]>(url).subscribe({
      next: (msgs) => {
        this.conversaciones = msgs.map(msg => {
          const otroUser = msg.emisor.identificador === this.usuarioLogueado.identificador ? msg.receptor : msg.emisor;
          return {
             usuario: otroUser,
             ultimoMensaje: msg.contenido,
             fecha: msg.fechaEnvio
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar conversaciones', err)
    });
  }

  seleccionarChat(id: number) {
    // Si ya estamos en este chat, no hacemos nada
    if (this.receptor?.identificador === id) return;
    
    // Reseteamos el receptor para mostrar el loader/estado vacío temporal
    this.receptor = null;
    this.mensajes = [];
    
    // Navegamos a la nueva ruta y como estamos suscritos a params, cargará el nuevo chat
    this.router.navigate(['/chat', id]);
  }

  volverAContactos() {
    this.router.navigate(['/chat']);
  }

  enviar() {
    if (this.nuevoMensaje.trim() && this.receptor) {
      this.chatService.enviarMensaje(this.receptor.identificador, this.nuevoMensaje);
      this.nuevoMensaje = '';
    }
  }

  get contactosFiltrados() {
    if (!this.filtroContactos) {
      return this.conversaciones;
    }
    const termino = this.filtroContactos.toLowerCase();
    return this.conversaciones.filter(c => 
      c.usuario.nombre.toLowerCase().includes(termino)
    );
  }

  ngOnDestroy() {
    this.chatService.chatActivoId = null; // Avisamos que cerramos el chat
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
