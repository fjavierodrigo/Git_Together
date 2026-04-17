package gittogether.tfg.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.services.MensajeService;

@RestController
@RequestMapping("/api/mensajes-foro")
@CrossOrigin(origins = "http://localhost:4200") // Para conectar con Angular
public class MensajeController {

    @Autowired
    private MensajeService mensajeService;

    // Endpoint: http://localhost:8080/api/mensajes-foro/crear
    @PostMapping("/registrar")
    public ResponseEntity<?> crearMensaje(@RequestBody Mensaje mensaje) {
        try {
            Mensaje nuevoMensaje = mensajeService.crearMensaje(mensaje);
            return ResponseEntity.ok(nuevoMensaje);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * GET http://localhost:8080/api/mensajes-foro/todos
     * Usado para cargar el muro del foro en Angular.
     */
    @GetMapping("/todos")
    public ResponseEntity<List<Mensaje>> obtenerTodos() {
        List<Mensaje> mensajes = mensajeService.listarTodos();
        if (mensajes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(mensajes);
    }

    /**
     * GET http://localhost:8080/api/mensajes-foro/tema/{id}
     * Filtra mensajes por un tema específico
     */
    @GetMapping("/tema/{temaId}")
    public ResponseEntity<List<Mensaje>> obtenerPorTema(@PathVariable int temaId) {
        return ResponseEntity.ok(mensajeService.obtenerMensajesDeUnTema(temaId));
    }
}