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
import java.util.List;

@Service
public class LikesService {

	@Autowired
	private LikesRepository likesRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private MensajeRepository mensajeRepository;

	public Likes darLike(Likes like) {
		Usuario usuarioReal = usuarioRepository.findById(like.getUsuario().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));

		Mensaje mensajeReal = mensajeRepository.findById(like.getMensaje().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El mensaje no existe"));

		if (likesRepository.existsByUsuarioAndMensaje(usuarioReal, mensajeReal)) {
			throw new RuntimeException("El usuario ya le ha dado like a este mensaje");
		}

		like.setFecha(LocalDate.now());
		like.setUsuario(usuarioReal);
		like.setMensaje(mensajeReal);

		return likesRepository.save(like);
	}

	public int contarLikesDeMensaje(int mensajeId) {
		return likesRepository.countByMensajeIdentificador(mensajeId);
	}

	public boolean comprobarSiUsuarioDioLike(int usuarioId, int mensajeId) {
		Usuario usuarioReal = usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		Mensaje mensajeReal = mensajeRepository.findById(mensajeId)
				.orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));

		return likesRepository.existsByUsuarioAndMensaje(usuarioReal, mensajeReal);
	}

	public List<Integer> obtenerLikesUsuarioEnTema(int usuarioId, int temaId) {
		return likesRepository.findMensajeIdsByUsuarioAndTemaId(usuarioId, temaId);
	}

	public void quitarLike(int usuarioId, int mensajeId) {
		Usuario usuarioReal = usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		Mensaje mensajeReal = mensajeRepository.findById(mensajeId)
				.orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));

		Likes like = likesRepository.findByUsuarioAndMensaje(usuarioReal, mensajeReal)
				.orElseThrow(() -> new RuntimeException("El like no existe"));

		likesRepository.delete(like);
	}
}