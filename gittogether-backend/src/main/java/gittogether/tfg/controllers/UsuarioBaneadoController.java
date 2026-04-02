package gittogether.tfg.controllers;

import gittogether.tfg.entities.UsuarioBaneado;
import gittogether.tfg.services.UsuarioBaneadoService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/baneos")
@CrossOrigin(origins = "*")
public class UsuarioBaneadoController {

	@Autowired
	private UsuarioBaneadoService baneadoService;

	// Endpoint: http://localhost:8080/api/baneos/aplicar
	@PostMapping("/aplicar")
	public ResponseEntity<?> aplicarBaneo(@RequestBody UsuarioBaneado baneo) {
		try {
			UsuarioBaneado nuevoBaneo = baneadoService.banearUsuario(baneo);
			return ResponseEntity.ok(nuevoBaneo);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body("Error al banear: " + e.getMessage());
		}
	}

	@GetMapping
	public ResponseEntity<List<UsuarioBaneado>> listarBaneos() {
		return ResponseEntity.ok(baneadoService.obtenerTodosLosBaneos());
	}
}