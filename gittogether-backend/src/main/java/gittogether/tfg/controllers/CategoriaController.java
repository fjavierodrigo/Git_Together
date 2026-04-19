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

import gittogether.tfg.entities.Categoria;
import gittogether.tfg.repositories.CategoriaRepository;
import gittogether.tfg.services.CategoriaService;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class CategoriaController {

	@Autowired
	private CategoriaRepository categoriaRepository;
	
	@Autowired
	private CategoriaService categoriaService;

	// Crear categoria nueva
	@PostMapping
	public Categoria crearCategoria(@RequestBody Categoria nuevaCategoria) {
		return categoriaRepository.save(nuevaCategoria);
	}
	
	// Obtenemos todas las categorías
	@GetMapping
	public List<Categoria> listar() {
		return categoriaRepository.findAll();
	}
	
	// Endpoint para eliminar una categoría
	@DeleteMapping("/{id}")
	public ResponseEntity<?> eliminarCategoria(@PathVariable Integer id) {
		try {
			categoriaService.eliminarCategoria(id);
			return ResponseEntity.ok().build();
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error al eliminar la categoría: " + e.getMessage());
		}
	}

	// Endpoint para editar el nombre de una categoría
	@PutMapping("/{id}")
	public ResponseEntity<?> editarCategoria(@PathVariable Integer id, @RequestBody java.util.Map<String, String> payload) {
		try {
			String nuevoNombre = payload.get("nombre");
			Categoria categoriaActualizada = categoriaService.editarCategoria(id, nuevoNombre);
			return ResponseEntity.ok(categoriaActualizada);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error al editar la categoría: " + e.getMessage());
		}
	}
}
