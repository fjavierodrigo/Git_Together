package gittogether.tfg.services;

import gittogether.tfg.entities.Likes;
import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.repositories.LikesRepository;
import gittogether.tfg.repositories.MensajeRepository;
import gittogether.tfg.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class LikesService {

	@Autowired
	private LikesRepository likesRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private MensajeRepository mensajeRepository;

	public Likes darLike(Likes like) {
		// 1. Buscamos al usuario real y al mensaje real
		Usuario usuarioReal = usuarioRepository.findById(like.getUsuario().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));

		Mensaje mensajeReal = mensajeRepository.findById(like.getMensaje().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El mensaje no existe"));

		// 2. Comprobamos que no le haya dado like ya
		if (likesRepository.existsByUsuarioAndMensaje(usuarioReal, mensajeReal)) {
			throw new RuntimeException("El usuario ya le ha dado like a este mensaje");
		}

		// 3. Asignamos la fecha de hoy y los objetos completos
		like.setFecha(LocalDate.now());
		like.setUsuario(usuarioReal);
		like.setMensaje(mensajeReal);

		return likesRepository.save(like);
	}

	// Obtener el número total de likes de un mensaje
	public int contarLikesDeMensaje(int mensajeId) {
		return likesRepository.countByMensajeIdentificador(mensajeId);
	}

	// Comprobar si un usuario en concreto ya le dio like a ese mensaje
	public boolean comprobarSiUsuarioDioLike(int usuarioId, int mensajeId) {
		Usuario usuarioReal = usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		Mensaje mensajeReal = mensajeRepository.findById(mensajeId)
				.orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));

		return likesRepository.existsByUsuarioAndMensaje(usuarioReal, mensajeReal);
	}
}