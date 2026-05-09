import { Injectable, inject } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../components/services/usuario';

@Injectable({
  providedIn: 'root'
})
export class ChatWebSocketService {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messageSubject.asObservable();
  
  private unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCount.asObservable();
  
  private notifications = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notifications.asObservable();
  
  private usuarioService = inject(Usuario);
  private connected = new BehaviorSubject<boolean>(false);
  public connected$ = this.connected.asObservable();
  
  public chatActivoId: number | null = null;

  constructor() {
    // Escuchamos al usuario para conectar/desconectar automáticamente
    this.usuarioService.currentUser$.subscribe(user => {
      if (user) {
        // Pequeño delay para asegurar que el token esté listo si acaba de loguearse
        setTimeout(() => this.conectar(), 500);
      } else {
        this.desconectar();
      }
    });
  }

  private conectar() {
    const usuario = this.usuarioService.getUsuarioLogueado();
    if (!usuario) return;

    // Configuramos el cliente STOMP
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      debug: (str) => { console.log(str); },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Conectado a WebSocket: ' + frame);
      this.connected.next(true);

      // Nos suscribimos a nuestros mensajes privados
      // La ruta debe coincidir con lo que pusimos en el backend: /user/{id}/queue/messages
      this.stompClient?.subscribe(`/user/${usuario.identificador}/queue/messages`, (message: Message) => {
        if (message.body) {
          const msg = JSON.parse(message.body);
          this.messageSubject.next(msg);
          
          // Solo incrementamos si el mensaje no es nuestro (aunque ya se filtra por destino)
          // Y además, evitamos notificar si estamos hablando JUSTO AHORA con el emisor.
          if (msg.emisor.identificador !== usuario.identificador && msg.emisor.identificador !== this.chatActivoId) {
            this.unreadCount.next(this.unreadCount.value + 1);
            
            // Guardamos la notificación (máximo 5 para no saturar)
            const currentNav = this.notifications.value;
            this.notifications.next([msg, ...currentNav].slice(0, 5));
          }
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Error de STOMP', frame.headers['message']);
      console.error('Detalles: ', frame.body);
      this.connected.next(false);
    };

    this.stompClient.activate();
  }

  enviarMensaje(receptorId: number, contenido: string) {
    const emisor = this.usuarioService.getUsuarioLogueado();
    if (!emisor || !this.stompClient || !this.stompClient.connected) return;

    const mensaje = {
      contenido: contenido,
      emisor: { identificador: emisor.identificador },
      receptor: { identificador: receptorId }
    };

    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(mensaje)
    });
  }

  resetUnreadCount() {
    this.unreadCount.next(0);
    this.notifications.next([]);
  }

  desconectar() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected.next(false);
    }
  }
}
