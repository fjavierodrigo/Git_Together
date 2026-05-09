import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
import { ChatWebSocketService } from '../../services/chat-websocket.service';
import { Usuario } from '../services/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef;

  private chatService = inject(ChatWebSocketService);
  private usuarioService = inject(Usuario);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  mensajes: any[] = [];
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

    this.route.params.subscribe(params => {
      const receptorId = params['id'];
      if (receptorId) {
        this.cargarReceptor(Number(receptorId));
        this.cargarHistorial(Number(receptorId));
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
      this.cdr.detectChanges();
    });
  }

  cargarHistorial(receptorId: number) {
    // Usamos el NUEVO controlador aislado para evitar conflictos
    const url = `http://localhost:8080/api/chat-completo/historial?usuarioUno=${this.usuarioLogueado.identificador}&usuarioDos=${receptorId}`;
    this.http.get<any[]>(url)
      .subscribe({
        next: (msgs) => {
          this.mensajes = msgs;
          this.cdr.detectChanges();
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => {
          console.error('Error cargando historial:', err);
        }
      });
  }

  enviar() {
    if (this.nuevoMensaje.trim() && this.receptor) {
      this.chatService.enviarMensaje(this.receptor.identificador, this.nuevoMensaje);
      this.nuevoMensaje = '';
    }
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
