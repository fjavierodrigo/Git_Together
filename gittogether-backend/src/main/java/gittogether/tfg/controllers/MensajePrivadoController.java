package gittogether.tfg.controllers;

import gittogether.tfg.entities.MensajePrivado;
import gittogether.tfg.services.MensajePrivadoService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mensajes")
@CrossOrigin(origins = "*")
public class MensajePrivadoController {

	@Autowired
	private MensajePrivadoService mensajeService;

	// Endpoint: http://localhost:8080/api/mensajes/enviar
	@PostMapping("/registrar")
	public ResponseEntity<?> enviar(@RequestBody MensajePrivado mensaje) {
		try {
			MensajePrivado nuevoMensaje = mensajeService.enviarMensaje(mensaje);
			return ResponseEntity.ok(nuevoMensaje);
		} catch (Exception e) {
			// Si falla algo (ej. el usuario no existe), devolvemos el error
			return ResponseEntity.badRequest().body("Error al enviar mensaje: " + e.getMessage());
		}
	}

	// Endpoint: GET http://localhost:8080/api/mensajes/recibidos/2
	@GetMapping("/recibidos/{usuarioId}")
	public ResponseEntity<List<MensajePrivado>> verBandejaEntrada(@PathVariable int usuarioId) {
		return ResponseEntity.ok(mensajeService.obtenerBandejaEntrada(usuarioId));
	}
}