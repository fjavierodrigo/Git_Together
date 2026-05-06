package gittogether.tfg.controllers;

import gittogether.tfg.entities.UsuarioBaneado;
import gittogether.tfg.services.UsuarioBaneadoService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import gittogether.tfg.services.S3Service;
import gittogether.tfg.repositories.UsuarioRepository;
import gittogether.tfg.entities.Usuario;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@RestController
@RequestMapping("/api/baneos")
@CrossOrigin(origins = "*")
public class UsuarioBaneadoController {

	@org.springframework.beans.factory.annotation.Autowired
	private UsuarioBaneadoService baneadoService;

	@org.springframework.beans.factory.annotation.Autowired
	private S3Service s3Service;

	@org.springframework.beans.factory.annotation.Autowired
	private UsuarioRepository usuarioRepository;

	// Endpoint: http://localhost:8080/api/baneos/aplicar
	@PostMapping(value = "/aplicar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> aplicarBaneo(
			@RequestPart("baneo") String baneoJson,
			@RequestPart(value = "archivos", required = false) List<MultipartFile> archivos) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.registerModule(new JavaTimeModule());
			UsuarioBaneado baneo = objectMapper.readValue(baneoJson, UsuarioBaneado.class);

			// Necesitamos el nombre real del usuario para la carpeta de S3
			Usuario usuarioReal = usuarioRepository.findById(baneo.getUsuario().getIdentificador())
					.orElseThrow(() -> new RuntimeException("Usuario a banear no encontrado"));

			if (archivos != null && !archivos.isEmpty()) {
				String urlsEvidencia = "";
				for (MultipartFile archivo : archivos) {
					String ruta = "baneos/" + usuarioReal.getNombre().replace(" ", "_");
					String url = s3Service.subirArchivoConRuta(archivo, ruta);
					urlsEvidencia += url + ",";
				}
				// Quitamos la última coma
				if (urlsEvidencia.endsWith(",")) {
					urlsEvidencia = urlsEvidencia.substring(0, urlsEvidencia.length() - 1);
				}

				// Si ya había evidencia en texto, la concatenamos
				if (baneo.getEvidencia() != null && !baneo.getEvidencia().isEmpty()) {
					baneo.setEvidencia(baneo.getEvidencia() + "\nArchivos adjuntos: " + urlsEvidencia);
				} else {
					baneo.setEvidencia(urlsEvidencia);
				}
			}

			UsuarioBaneado nuevoBaneo = baneadoService.banearUsuario(baneo);
			return ResponseEntity.ok(nuevoBaneo);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Error al banear: " + e.getMessage());
		}
	}

	@GetMapping
	public ResponseEntity<List<UsuarioBaneado>> listarBaneos() {
		return ResponseEntity.ok(baneadoService.obtenerTodosLosBaneos());
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> actualizarBaneo(@PathVariable int id, @RequestBody UsuarioBaneado baneo) {
		try {
			return ResponseEntity.ok(baneadoService.actualizarBaneo(id, baneo));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> eliminarBaneo(@PathVariable int id) {
		try {
			baneadoService.eliminarBaneo(id);
			return ResponseEntity.ok().build();
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PostMapping("/reclamar")
	public ResponseEntity<?> reclamarBaneo(@RequestBody java.util.Map<String, Object> payload) {
		try {
			int usuarioId = (int) payload.get("usuarioId");
			String mensaje = (String) payload.get("mensaje");
			baneadoService.reclamarBaneo(usuarioId, mensaje);
			return ResponseEntity.ok().build();
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/reclamaciones")
	public ResponseEntity<List<UsuarioBaneado>> listarReclamaciones() {
		return ResponseEntity.ok(baneadoService.obtenerReclamacionesPendientes());
	}

	@PostMapping("/revisar/{id}")
	public ResponseEntity<?> marcarComoRevisada(@PathVariable int id) {
		try {
			baneadoService.marcarReclamacionComoRevisada(id);
			return ResponseEntity.ok().build();
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}