package gittogether.tfg.controllers;

import java.time.LocalDate;
import java.util.Arrays;
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

	// Seguridad para Avatares: Solo imágenes y máximo 2MB
	private static final List<String> ALLOWED_AVATAR_TYPES = Arrays.asList("image/jpeg", "image/png", "image/gif");
	private static final long MAX_AVATAR_SIZE = 2 * 1024 * 1024;

	private void validarAvatar(MultipartFile file) {
		if (file == null || file.isEmpty()) return;
		if (file.getSize() > MAX_AVATAR_SIZE) {
			throw new RuntimeException("La foto de perfil es demasiado grande (Máximo 2MB)");
		}
		if (!ALLOWED_AVATAR_TYPES.contains(file.getContentType())) {
			throw new RuntimeException("El avatar debe ser una imagen (jpg, png, gif)");
		}
	}

	@PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> registrar(
			@RequestPart("usuario") String usuarioJson,
			@RequestPart(value = "avatar", required = false) MultipartFile archivo) throws Exception {
		
		validarAvatar(archivo);
		// 1. Convertir el String JSON manualmente a objeto Usuario
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.registerModule(new JavaTimeModule()); // Para manejar LocalDate
		Usuario usuario = objectMapper.readValue(usuarioJson, Usuario.class);

		// 2. Subir imagen a S3 si existe
		if (archivo != null && !archivo.isEmpty()) {
			String nombreUser = usuario.getNombre() != null ? usuario.getNombre() : "nuevo_usuario";
			String rutaAvatar = "avatares/" + nombreUser.replace(" ", "_");
			String urlImagen = s3Service.subirArchivoConRuta(archivo, rutaAvatar);
			usuario.setAvatar(urlImagen);
		}

		// 3. Asignar fecha si no viene
		if (usuario.getFechaRegistro() == null) {
			usuario.setFechaRegistro(LocalDate.now());
		}

		// 4. Guardar en BD
		Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
		s3Service.procesarAvatar(nuevoUsuario);
		return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
	}

	// GET: http://localhost:8080/api/usuarios
	@GetMapping
	public ResponseEntity<List<Usuario>> listarUsuarios() {
		List<Usuario> usuarios = usuarioService.obtenerTodos();
		s3Service.procesarAvatares(usuarios);
		return ResponseEntity.ok(usuarios);
	}

	// GET: http://localhost:8080/api/usuarios/{id}
	@GetMapping("/{id}")
	public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable int id) {
		try {
			Usuario usuario = usuarioService.obtenerPorId(id);
			s3Service.procesarAvatar(usuario);
			return ResponseEntity.ok(usuario);
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(e.getMessage());
		}
	}

	@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> actualizarPerfil(
			@PathVariable int id,
			@RequestPart("usuario") String usuarioJson,
			@RequestPart(value = "avatar", required = false) MultipartFile archivo) {
		try {
			validarAvatar(archivo);
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.registerModule(new JavaTimeModule());
			Usuario usuarioDatos = objectMapper.readValue(usuarioJson, Usuario.class);

			String urlImagen = null;
			if (archivo != null && !archivo.isEmpty()) {
				Usuario usuarioReal = usuarioService.obtenerPorId(id);
				String nombreUser = usuarioReal.getNombre() != null ? usuarioReal.getNombre() : "usuario_" + id;
				String rutaAvatar = "avatares/" + nombreUser.replace(" ", "_");
				urlImagen = s3Service.subirArchivoConRuta(archivo, rutaAvatar);
			} else if (usuarioDatos.getAvatar() != null && usuarioDatos.getAvatar().equalsIgnoreCase("null")) {
				// Si no hay archivo pero el JSON dice "null", es que queremos borrar la foto
				urlImagen = "null";
			}

			Usuario usuario = usuarioService.actualizarPerfil(id, usuarioDatos.getDescripcion(), urlImagen);
			s3Service.procesarAvatar(usuario);
			return ResponseEntity.ok(usuario);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(400).body("Error al actualizar el perfil: " + e.getMessage());
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
			s3Service.procesarAvatar(usuario);
			// Generamos un token
			String jwtToken = JwtUtil.generateToken(usuario.getEmail());

			// Enviamos el objeto combinado
			return ResponseEntity.ok(new LoginResponse(jwtToken, usuario));
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado o contraseña incorrecta");
		}
	}
}
