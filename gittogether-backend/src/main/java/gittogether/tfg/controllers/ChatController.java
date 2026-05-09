package gittogether.tfg.controllers;

import gittogether.tfg.entities.MensajePrivado;
import gittogether.tfg.services.MensajePrivadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MensajePrivadoService mensajePrivadoService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MensajePrivado mensaje) {
        // Guardamos el mensaje en la base de datos para que no se pierda
        MensajePrivado guardado = mensajePrivadoService.enviarMensaje(mensaje);

        // Enviamos el mensaje al receptor en tiempo real
        // La ruta final donde el receptor estará escuchando será /user/{idUsuario}/queue/messages
        messagingTemplate.convertAndSendToUser(
                String.valueOf(guardado.getReceptor().getIdentificador()), 
                "/queue/messages", 
                guardado
        );
        
        // Opcional: También se lo enviamos al emisor (por si tiene varias pestañas abiertas o para confirmar)
        messagingTemplate.convertAndSendToUser(
                String.valueOf(guardado.getEmisor().getIdentificador()), 
                "/queue/messages", 
                guardado
        );
    }
}
