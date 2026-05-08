package gittogether.tfg.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.services.MensajeService;
import gittogether.tfg.services.S3Service;
import org.springframework.http.HttpStatus;

@RestController
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE })
@RequestMapping("/api/mensajes-foro")
public class MensajeController {

    @Autowired
    private MensajeService mensajeService;

    @Autowired
    private S3Service s3Service;

    @PostMapping("/registrar")
    public ResponseEntity<?> crearMensaje(@RequestBody Mensaje mensaje) {
        try {
            Mensaje nuevoMensaje = mensajeService.crearMensaje(mensaje);
            s3Service.procesarAvatar(nuevoMensaje.getUsuario());
            s3Service.procesarArchivos(nuevoMensaje.getArchivos());
            return ResponseEntity.ok(nuevoMensaje);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/todos")
    public ResponseEntity<List<Mensaje>> obtenerTodos() {
        List<Mensaje> mensajes = mensajeService.listarTodos();
        if (mensajes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        mensajes.forEach(m -> {
            s3Service.procesarAvatar(m.getUsuario());
            s3Service.procesarArchivos(m.getArchivos());
        });
        return ResponseEntity.ok(mensajes);
    }

    @GetMapping("/tema/{temaId}")
    public ResponseEntity<List<Mensaje>> obtenerPorTema(@PathVariable int temaId) {
        List<Mensaje> mensajes = mensajeService.obtenerMensajesDeUnTema(temaId);
        mensajes.forEach(m -> {
            s3Service.procesarAvatar(m.getUsuario());
            s3Service.procesarArchivos(m.getArchivos());
        });
        return ResponseEntity.ok(mensajes);
    }

    @GetMapping("/por-usuario/{usuarioId}")
    public List<Mensaje> obtenerPorUsuario(@PathVariable("usuarioId") int usuarioId) {
        System.out.println("-> Cargando mensajes del usuario ID: " + usuarioId);
        List<Mensaje> mensajes = mensajeService.obtenerMensajesDeUnUsuario(usuarioId);
        mensajes.forEach(m -> {
            if (m.getUsuario() != null) s3Service.procesarAvatar(m.getUsuario());
            if (m.getArchivos() != null) s3Service.procesarArchivos(m.getArchivos());
        });
        return mensajes;
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMensaje(@PathVariable Integer id) {
        try {
            mensajeService.eliminarMensaje(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarMensaje(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        try {
            String nuevoContenido = payload.get("contenido");
            Mensaje mensajeActualizado = mensajeService.editarMensaje(id, nuevoContenido);
            s3Service.procesarAvatar(mensajeActualizado.getUsuario());
            s3Service.procesarArchivos(mensajeActualizado.getArchivos());
            return ResponseEntity.ok(mensajeActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error al editar: " + e.getMessage());
        }
    }
}
