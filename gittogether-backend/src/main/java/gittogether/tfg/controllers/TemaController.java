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
import gittogether.tfg.services.S3Service;

@RestController
@RequestMapping("/api/temas")
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
		RequestMethod.DELETE })

public class TemaController {

	@Autowired
	private TemaService temaService;

	@Autowired
	private S3Service s3Service;

	@GetMapping
	public List<Tema> listar() {
		List<Tema> temas = temaService.listarTemas();
		temas.forEach(t -> {
			s3Service.procesarAvatar(t.getUsuario());
			s3Service.procesarArchivos(t.getArchivos());
		});
		return temas;
	}

	@GetMapping("/{id}")
	public ResponseEntity<Tema> obtenerPorId(@PathVariable int id) {
		return temaService.obtenerTemaPorId(id)
				.map(t -> {
					s3Service.procesarAvatar(t.getUsuario());
					s3Service.procesarArchivos(t.getArchivos());
					return ResponseEntity.ok(t);
				})
				.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/slug/{slug}")
	public ResponseEntity<Tema> obtenerPorSlug(@PathVariable String slug) {
		return temaService.obtenerTemaPorSlug(slug)
				.map(t -> {
					s3Service.procesarAvatar(t.getUsuario());
					s3Service.procesarArchivos(t.getArchivos());
					return ResponseEntity.ok(t);
				})
				.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/categoria/{id}")
	public List<Tema> listarPorCategoria(@PathVariable int id) {
		List<Tema> temas = temaService.obtenerTemasPorCategoria(id);
		temas.forEach(t -> {
			s3Service.procesarAvatar(t.getUsuario());
			s3Service.procesarArchivos(t.getArchivos());
		});
		return temas;
	}

	@GetMapping("/tag/{nombre}")
	public List<Tema> listarPorTag(@PathVariable String nombre) {
		List<Tema> temas = temaService.obtenerTemasPorTag(nombre);
		temas.forEach(t -> {
			s3Service.procesarAvatar(t.getUsuario());
			s3Service.procesarArchivos(t.getArchivos());
		});
		return temas;
	}

	@GetMapping("/{id}/relacionados")
	public List<Tema> obtenerRelacionados(@PathVariable int id) {
		List<Tema> temas = temaService.obtenerTemasRelacionados(id);
		temas.forEach(t -> {
			s3Service.procesarAvatar(t.getUsuario());
			s3Service.procesarArchivos(t.getArchivos());
		});
		return temas;
	}

	@PostMapping
	public Tema crear(@RequestBody Tema tema) {
		Tema nuevoTema = temaService.crearTema(tema);
		s3Service.procesarAvatar(nuevoTema.getUsuario());
		s3Service.procesarArchivos(nuevoTema.getArchivos());
		return nuevoTema;
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
	public ResponseEntity<?> editarTema(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> payload) {
		try {
			String nuevoTitulo = (String) payload.get("titulo");
			String nuevaDescripcion = (String) payload.get("descripcion");
			
			List<String> tagsNombres = null;
			if (payload.get("tags") != null) {
				tagsNombres = (List<String>) payload.get("tags");
			}

			Tema temaActualizado = temaService.editarTema(id, nuevoTitulo, nuevaDescripcion, tagsNombres);
			s3Service.procesarAvatar(temaActualizado.getUsuario());
			s3Service.procesarArchivos(temaActualizado.getArchivos());
			return ResponseEntity.ok(temaActualizado);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error al editar el tema: " + e.getMessage());
		}
	}
}
