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

import gittogether.tfg.entities.Tema;
import gittogether.tfg.services.TemaService;

@RestController
@RequestMapping("/api/temas")
@CrossOrigin(origins = "*")
public class TemaController {

	@Autowired
	private TemaService temaService;

	// Endpoint: http://localhost:8080/api/temas/crear
	@PostMapping("/registrar")
	public ResponseEntity<?> crearTema(@RequestBody Tema tema) {
		try {
			Tema nuevoTema = temaService.crearTema(tema);
			return ResponseEntity.ok(nuevoTema);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error: " + e.getMessage());
		}
	}

	@GetMapping("/todos")
	public ResponseEntity<List<Tema>> obtenerTodos() {
		List<Tema> temas = temaService.listarTemas();
		return ResponseEntity.ok(temas);
	}

	// Endpoint: GET http://localhost:8080/api/temas/categoria/1
	@GetMapping("/categoria/{categoriaId}")
	public ResponseEntity<List<Tema>> listarPorCategoria(@PathVariable int categoriaId) {
		return ResponseEntity.ok(temaService.obtenerTemasPorCategoria(categoriaId));
	}

}