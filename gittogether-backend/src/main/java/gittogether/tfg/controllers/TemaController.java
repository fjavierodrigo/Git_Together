package gittogether.tfg.controllers;

import java.util.List;

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

import gittogether.tfg.entities.Tema;
import gittogether.tfg.services.TemaService;

@RestController
@RequestMapping("/api/temas")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class TemaController {

	@Autowired
	private TemaService temaService;

	@GetMapping
	public List<Tema> listar() {
		return temaService.listarTemas();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Tema> obtenerPorId(@PathVariable int id) {
		return temaService.obtenerTemaPorId(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/slug/{slug}")
	public ResponseEntity<Tema> obtenerPorSlug(@PathVariable String slug) {
		return temaService.obtenerTemaPorSlug(slug)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/categoria/{id}")
	public List<Tema> listarPorCategoria(@PathVariable int id) {
		return temaService.obtenerTemasPorCategoria(id);
	}

	@PostMapping
	public Tema crear(@RequestBody Tema tema) {
		return temaService.crearTema(tema);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<?> eliminarTema(@PathVariable Integer id) {
		try {
			temaService.eliminarTema(id);
			return ResponseEntity.ok().build();
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error al eliminar el tema: " + e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> editarTema(@PathVariable Integer id, @RequestBody java.util.Map<String, String> payload) {
		try {
			String nuevoTitulo = payload.get("titulo");
			Tema temaActualizado = temaService.editarTema(id, nuevoTitulo);
			return ResponseEntity.ok(temaActualizado);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error al editar el tema: " + e.getMessage());
		}
	}
}
