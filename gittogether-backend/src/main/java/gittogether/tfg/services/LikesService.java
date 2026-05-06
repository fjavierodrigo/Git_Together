package gittogether.tfg.services;

import gittogether.tfg.entities.Likes;
import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.entities.Tema;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.repositories.LikesRepository;
import gittogether.tfg.repositories.MensajeRepository;
import gittogether.tfg.repositories.TemaRepository;
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

	@Autowired
	private TemaRepository temaRepository;

	public Likes darLike(Likes like) {
		System.out.println("SERVICE DEBUG: Iniciando darLike...");
		if (like.getUsuario() == null || like.getUsuario().getIdentificador() == null) {
			throw new RuntimeException("El usuario es obligatorio");
		}

		Usuario usuarioReal = usuarioRepository.findById(like.getUsuario().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));

		like.setUsuario(usuarioReal);
		like.setFecha(LocalDate.now());

		// Caso de mensaje
		if (like.getMensaje() != null && like.getMensaje().getIdentificador() != null && like.getMensaje().getIdentificador() > 0) {
			System.out.println("SERVICE DEBUG: Procesando like para MENSAJE ID: " + like.getMensaje().getIdentificador());
			Mensaje mensajeReal = mensajeRepository.findById(like.getMensaje().getIdentificador())
					.orElseThrow(() -> new RuntimeException("El mensaje no existe"));
			if (likesRepository.existsByUsuarioAndMensaje(usuarioReal, mensajeReal)) {
				throw new RuntimeException("El usuario ya le ha dado like a este mensaje");
			}
			like.setMensaje(mensajeReal);
			like.setTema(null); // Aseguramos que sea uno o el otro
		} 
		// Caso de tema
		else if (like.getTema() != null && like.getTema().getIdentificador() != null && like.getTema().getIdentificador() > 0) {
			System.out.println("SERVICE DEBUG: Procesando like para TEMA ID: " + like.getTema().getIdentificador());
			Tema temaReal = temaRepository.findById(like.getTema().getIdentificador())
					.orElseThrow(() -> new RuntimeException("El tema no existe"));
			if (likesRepository.existsByUsuarioAndTema(usuarioReal, temaReal)) {
				throw new RuntimeException("El usuario ya le ha dado like a este tema");
			}
			like.setTema(temaReal);
			like.setMensaje(null); // Aseguramos que el otro sea nulo
		} else {
			throw new RuntimeException("Debe especificar un mensaje o un tema para dar like");
		}

		System.out.println("SERVICE DEBUG: Guardando like en base de datos...");
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

	public boolean comprobarSiUsuarioDioLikeTema(int usuarioId, int temaId) {
		Usuario usuarioReal = usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		Tema temaReal = temaRepository.findById(temaId)
				.orElseThrow(() -> new RuntimeException("Tema no encontrado"));
		return likesRepository.existsByUsuarioAndTema(usuarioReal, temaReal);
	}

	public int contarLikesDeTema(int temaId) {
		return likesRepository.countByTemaIdentificador(temaId);
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

	public void quitarLikeTema(int usuarioId, int temaId) {
		Usuario usuarioReal = usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		Tema temaReal = temaRepository.findById(temaId)
				.orElseThrow(() -> new RuntimeException("Tema no encontrado"));

		Likes like = likesRepository.findByUsuarioAndTema(usuarioReal, temaReal)
				.orElseThrow(() -> new RuntimeException("El like no existe"));

		likesRepository.delete(like);
	}
}