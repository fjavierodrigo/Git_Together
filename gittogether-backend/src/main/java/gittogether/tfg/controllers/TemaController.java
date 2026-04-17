package gittogether.tfg.controllers;

import gittogether.tfg.entities.Tema;
import gittogether.tfg.services.TemaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/temas")
@CrossOrigin(origins = "*") // Permite que Angular acceda a los datos
public class TemaController {

	@Autowired
	private TemaService temaService;

	// Endpoint para obtener todos los temas
	@GetMapping
	public List<Tema> listar() {
		return temaService.listarTemas();
	}

	// Endpoint para obtener un tema por ID
	@GetMapping("/{id}")
	public ResponseEntity<Tema> obtenerPorId(@PathVariable int id) {
		return temaService.obtenerTemaPorId(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	// Endpoint para obtener un tema por slug
	@GetMapping("/slug/{slug}")
	public ResponseEntity<Tema> obtenerPorSlug(@PathVariable String slug) {
		return temaService.obtenerTemaPorSlug(slug)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	// Endpoint para filtrar por categoría
	@GetMapping("/categoria/{id}")
	public List<Tema> listarPorCategoria(@PathVariable int id) {
		return temaService.obtenerTemasPorCategoria(id);
	}

	// Endpoint para crear un tema desde el frontend
	@PostMapping
	public Tema crear(@RequestBody Tema tema) {
		return temaService.crearTema(tema);
	}
}