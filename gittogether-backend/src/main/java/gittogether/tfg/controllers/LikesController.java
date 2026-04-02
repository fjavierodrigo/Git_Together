package gittogether.tfg.controllers;

import gittogether.tfg.entities.Likes;
import gittogether.tfg.services.LikesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikesController {

	@Autowired
	private LikesService likesService;

	// Endpoint: http://localhost:8080/api/likes/dar
	@PostMapping("/dar")
	public ResponseEntity<?> darLike(@RequestBody Likes like) {
		try {
			Likes nuevoLike = likesService.darLike(like);
			return ResponseEntity.ok(nuevoLike);
		} catch (RuntimeException e) {
			// Si ya le ha dado like, devolverá un error 400
			return ResponseEntity.badRequest().body("Error: " + e.getMessage());
		}
	}

	// GET: http://localhost:8080/api/likes/mensaje/1/cantidad
	// Te devuelve un número entero (ej: 5)
	@GetMapping("/mensaje/{mensajeId}/cantidad")
	public ResponseEntity<Integer> contarLikes(@PathVariable int mensajeId) {
		return ResponseEntity.ok(likesService.contarLikesDeMensaje(mensajeId));
	}

	// GET: http://localhost:8080/api/likes/mensaje/1/usuario/2
	// Te devuelve true (si ya le dio like) o false (si no le ha dado)
	@GetMapping("/mensaje/{mensajeId}/usuario/{usuarioId}")
	public ResponseEntity<Boolean> comprobarLike(@PathVariable int mensajeId, @PathVariable int usuarioId) {
		return ResponseEntity.ok(likesService.comprobarSiUsuarioDioLike(usuarioId, mensajeId));
	}
}