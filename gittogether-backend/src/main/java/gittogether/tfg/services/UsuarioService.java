package gittogether.tfg.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import gittogether.tfg.entities.Usuario;
import gittogether.tfg.entities.enums.TipoUsuario;
import gittogether.tfg.repositories.UsuarioRepository;

@Service
public class UsuarioService {

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private S3Service s3Service;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	public Usuario autenticar(String identificador, String password) {
		// Buscamos por nombre O por email usando el mismo texto
		Usuario usuario = usuarioRepository.findByNombreOrEmail(identificador, identificador)
				.orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos"));

		// Comparamos el hash de la BD con el texto plano recibido
		if (passwordEncoder.matches(password, usuario.getPassword())) {
			return usuario;
		} else {
			throw new RuntimeException("Usuario o contraseña incorrectos");
		}
	}

	public List<Usuario> listarTodos() {
		return usuarioRepository.findAll();
	}

	public Usuario registrarUsuario(Usuario usuario) {
		if (usuarioRepository.existsByNombre(usuario.getNombre())) {
			throw new RuntimeException("El nombre de usuario ya existe");
		}
		if (usuarioRepository.existsByEmail(usuario.getEmail())) {
			throw new RuntimeException("El email ya está registrado");
		}

		// Encriptamos la contraseña antes de guardar
		usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

		usuario.setFechaRegistro(LocalDate.now());
		usuario.setRol(TipoUsuario.Usuario);
		return usuarioRepository.save(usuario);
	}

	// Obtener TODOS los usuarios (Ideal para el panel del Admin)
	public List<Usuario> obtenerTodos() {
		return usuarioRepository.findAll();
	}

	// Obtener UN usuario por su ID (Ideal para ver su perfil)
	public Usuario obtenerPorId(int id) {
		return usuarioRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("El usuario con ID " + id + " no existe"));
	}

	public Usuario obtenerPorEmail(String email) {
		return usuarioRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
	}

	public Usuario actualizarPerfil(int id, String descripcion, String avatarUrl) {
		Usuario usuario = obtenerPorId(id);

		if (descripcion != null) {
			usuario.setDescripcion(descripcion);
		}

		// Si nos llega un nuevo avatar (o la instrucción de borrarlo)
		if (avatarUrl != null) {
			// 1. Borramos la foto antigua de S3 si existía
			if (usuario.getAvatar() != null && !usuario.getAvatar().isEmpty()) {
				s3Service.eliminarArchivo(usuario.getAvatar());
			}

			// 2. Asignamos la nueva llave (si es "" o "null" lo tratamos como borrado)
			if (avatarUrl.isEmpty() || avatarUrl.equalsIgnoreCase("null")) {
				usuario.setAvatar(null);
			} else {
				usuario.setAvatar(avatarUrl);
			}
		}

		return usuarioRepository.save(usuario);
	}
}