package gittogether.tfg.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilitamos un broker de mensajes sencillo
        // /topic para mensajes públicos (broadcast)
        // /user para mensajes privados (específicos de un usuario)
        config.enableSimpleBroker("/topic", "/user");
        
        // Prefijo para los mensajes que van del cliente al servidor (@MessageMapping)
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefijo para los mensajes privados que se envían a un usuario específico
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registramos el punto de entrada al que se conectará el cliente (Angular)
        registry.addEndpoint("/ws-chat")
                .setAllowedOrigins("http://localhost:4200") // Permitimos conexión desde el frontend
                .withSockJS(); // Soporte para navegadores que no soportan WebSockets
    }
}
