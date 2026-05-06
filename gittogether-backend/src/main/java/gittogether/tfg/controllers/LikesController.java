package gittogether.tfg.controllers;

import gittogether.tfg.entities.Likes;
import gittogether.tfg.services.LikesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikesController {

	@Autowired
	private LikesService likesService;

	@PostMapping("/dar")
	public ResponseEntity<?> darLike(@RequestBody Likes like) {
		try {
			Likes nuevoLike = likesService.darLike(like);
			return ResponseEntity.ok(nuevoLike);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error: " + e.getMessage());
		}
	}

	@DeleteMapping("/quitar/usuario/{usuarioId}/mensaje/{mensajeId}")
	public ResponseEntity<?> quitarLike(@PathVariable int usuarioId, @PathVariable int mensajeId) {
		try {
			likesService.quitarLike(usuarioId, mensajeId);
			return ResponseEntity.ok().build();
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error: " + e.getMessage());
		}
	}

	@GetMapping("/mensaje/{mensajeId}/cantidad")
	public ResponseEntity<Integer> contarLikes(@PathVariable int mensajeId) {
		return ResponseEntity.ok(likesService.contarLikesDeMensaje(mensajeId));
	}

	@GetMapping("/mensaje/{mensajeId}/usuario/{usuarioId}")
	public ResponseEntity<Boolean> comprobarLike(@PathVariable int mensajeId, @PathVariable int usuarioId) {
		return ResponseEntity.ok(likesService.comprobarSiUsuarioDioLike(usuarioId, mensajeId));
	}

	@GetMapping("/usuario/{usuarioId}/tema/{temaId}")
	public ResponseEntity<List<Integer>> obtenerLikesUsuarioEnTema(@PathVariable int usuarioId, @PathVariable int temaId) {
		return ResponseEntity.ok(likesService.obtenerLikesUsuarioEnTema(usuarioId, temaId));
	}
}