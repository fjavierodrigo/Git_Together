package gittogether.tfg.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import gittogether.tfg.entities.Usuario;
import gittogether.tfg.repositories.UsuarioRepository;

@Service
public class UsuarioService {

	@Autowired
	private UsuarioRepository usuarioRepository;


	public Usuario autenticar(String identificador, String password) {
	    // Buscamos por nombre O por email usando el mismo texto
	    return usuarioRepository.findByNombreOrEmail(identificador, identificador)
	        .filter(u -> u.getPassword().equals(password))
	        .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos"));
	}

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

	public Usuario registrarUsuario(Usuario usuario) {
		if (usuarioRepository.existsByNombre(usuario.getNombre())) {
			throw new RuntimeException("El nombre de usuario ya existe");
		}
		usuario.setFechaRegistro(LocalDate.now());
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
}