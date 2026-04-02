package gittogether.tfg.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gittogether.tfg.entities.Categoria;
import gittogether.tfg.services.CategoriaService;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

	@Autowired
	private CategoriaService categoriaService;

	// Endpoint para registrar una categoria
	@PostMapping("/registrar")
	public ResponseEntity<?> registrar(@RequestBody Categoria categoria) {
		try {
			Categoria nuevaCategoria = categoriaService.registrarCategoria(categoria);
			return ResponseEntity.ok(nuevaCategoria);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// Endpoint para listar todas: http://localhost:8080/api/categorias
	@GetMapping
	public ResponseEntity<List<Categoria>> listarCategorias() {
		List<Categoria> lista = categoriaService.obtenerTodas();
		return ResponseEntity.ok(lista); 
	}

	// Endpoint para Buscar Una: http://localhost:8080/api/categorias/{id}
	@GetMapping("/{id}")
	public ResponseEntity<?> obtenerCategoriaPorId(@PathVariable int id) {
		try {
			Categoria categoria = categoriaService.obtenerPorId(id);
			return ResponseEntity.ok(categoria);
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(e.getMessage()); // Devuelve un 404 Not Found si no existe
		}
	}
}
