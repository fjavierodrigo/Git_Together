package gittogether.tfg.controllers;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import gittogether.tfg.entities.LoginRequest;
import gittogether.tfg.entities.LoginResponse;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.repositories.MensajeRepository;
import gittogether.tfg.repositories.TemaRepository;
import gittogether.tfg.services.S3Service;
import gittogether.tfg.services.UsuarioService;
import gittogether.tfg.util.JwtUtil;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200") // lo utilizamos para realizar testeos en angular
public class UsuarioController {

	@Autowired
	private UsuarioService usuarioService;
	
	@Autowired
	private TemaRepository temaRepository;
	
	@Autowired
	private MensajeRepository mensajeRepository;
	
	@Autowired
	private S3Service s3Service;
	

	@PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registrar(
            @RequestPart("usuario") String usuarioJson, 
            @RequestPart(value = "avatar", required = false) MultipartFile archivo) {
        try {
            // 1. Convertir el String JSON manualmente a objeto Usuario
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule()); // Para manejar LocalDate
            Usuario usuario = objectMapper.readValue(usuarioJson, Usuario.class);

            // 2. Subir imagen a S3 si existe
            if (archivo != null && !archivo.isEmpty()) {
                String urlImagen = s3Service.subirArchivo(archivo);
                usuario.setAvatar(urlImagen);
            }

            // 3. Asignar fecha si no viene
            if (usuario.getFechaRegistro() == null) {
                usuario.setFechaRegistro(LocalDate.now());
            }

            // 4. Guardar en BD
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error en el servidor: " + e.getMessage());
        }
    }
	

	// GET: http://localhost:8080/api/usuarios
	@GetMapping
	public ResponseEntity<List<Usuario>> listarUsuarios() {
		return ResponseEntity.ok(usuarioService.obtenerTodos());
	}

	// GET: http://localhost:8080/api/usuarios/{id}
	@GetMapping("/{id}")
	public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable int id) {
		try {
			Usuario usuario = usuarioService.obtenerPorId(id);
			return ResponseEntity.ok(usuario);
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> actualizarPerfil(@PathVariable int id, @RequestBody Map<String, String> body) {
		try {
			String descripcion = body.get("descripcion");
			Usuario usuario = usuarioService.actualizarPerfil(id, descripcion);
			return ResponseEntity.ok(usuario);
		} catch (RuntimeException e) {
			return ResponseEntity.status(400).body(e.getMessage());
		}
	}

	@GetMapping("/{id}/stats")
	public ResponseEntity<?> obtenerEstadisticas(@PathVariable int id) {
		try {
			int temas = temaRepository.countByUsuarioIdentificador(id);
			int mensajes = mensajeRepository.countByUsuarioIdentificador(id);
			return ResponseEntity.ok(Map.of("temasCreados", temas, "mensajes", mensajes));
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Error al obtener estadísticas");
		}
	}
	
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
	    // Buscamos al usuario en la BD
	    Usuario usuario = usuarioService.autenticar(loginRequest.getIdentificador(), loginRequest.getPassword());

	    if (usuario != null) {
	        // Generamos un token
	    	String jwtToken = JwtUtil.generateToken(usuario.getEmail());

	        // Enviamos el objeto combinado
	        return ResponseEntity.ok(new LoginResponse(jwtToken, usuario));
	    } else {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
	    }
	}
}
