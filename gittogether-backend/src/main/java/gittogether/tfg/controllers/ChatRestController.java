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

    @GetMapping("/api/chat-completo/historial")
    public ResponseEntity<List<MensajePrivado>> obtenerHistorial(
            @RequestParam("usuarioUno") Integer u1, 
            @RequestParam("usuarioDos") Integer u2) {
        
        List<MensajePrivado> historial = mensajeRepository.findChatHistory(u1, u2);
        return ResponseEntity.ok(historial);
    }
}
