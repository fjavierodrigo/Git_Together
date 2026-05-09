package gittogether.tfg.controllers;

import gittogether.tfg.entities.MensajePrivado;
import gittogether.tfg.repositories.MensajePrivadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ChatRestController {

    @Autowired
    private MensajePrivadoRepository mensajeRepository;

    // Cambiamos a una ruta de nivel raíz para máxima visibilidad
    @GetMapping("/api/chat-completo/historial")
    public ResponseEntity<List<MensajePrivado>> obtenerHistorial(
            @RequestParam("usuarioUno") Integer u1, 
            @RequestParam("usuarioDos") Integer u2) {
        
        List<MensajePrivado> historial = mensajeRepository.findChatHistory(u1, u2);
        return ResponseEntity.ok(historial);
    }

    @GetMapping("/api/chat-completo/conversaciones")
    public ResponseEntity<List<MensajePrivado>> obtenerConversaciones(@RequestParam("userId") Integer userId) {
        List<MensajePrivado> todos = mensajeRepository.findAllUserMessages(userId);
        
        // Usamos un Map para quedarnos solo con el mensaje más reciente (el primero que aparece) por cada usuario
        java.util.Map<Integer, MensajePrivado> conversaciones = new java.util.LinkedHashMap<>();
        
        for (MensajePrivado msg : todos) {
            int otroUsuarioId = msg.getEmisor().getIdentificador() == userId ? 
                                msg.getReceptor().getIdentificador() : 
                                msg.getEmisor().getIdentificador();
            
            // Como vienen ordenados por fecha DESC, el primero que entra en el map es el más reciente
            if (!conversaciones.containsKey(otroUsuarioId)) {
                conversaciones.put(otroUsuarioId, msg);
            }
        }
        
        return ResponseEntity.ok(new java.util.ArrayList<>(conversaciones.values()));
    }
}
