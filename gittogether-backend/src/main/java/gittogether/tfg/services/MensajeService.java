package gittogether.tfg.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.entities.Tema;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.repositories.MensajeRepository;
import gittogether.tfg.repositories.TemaRepository;
import gittogether.tfg.repositories.UsuarioRepository;

@Service
public class MensajeService {

	@Autowired
	private MensajeRepository mensajeRepository;

	@Autowired
	private TemaRepository temaRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;
	
	// Permite ejecutar sentencias SQL nativas directamente en la base de datos
	// Útil para evitar problemas de dependencias circulares o restricciones (Foreign Keys)
	@Autowired
	private JdbcTemplate jdbcTemplate;

	/**
	 * Registra un nuevo mensaje en la base de datos vinculado a un Tema y un Usuario.
	 */
	public Mensaje crearMensaje(Mensaje mensaje) {
		// Asignamos las fechas iniciales por defecto del mensaje
		mensaje.setFechaCreacion(LocalDate.now());
		mensaje.setFechaActualizacion(null);

		// Obtenemos los objetos persistidos (reales) desde la base de datos 
		// a partir de los IDs que nos llegan del frontend. Esto previene errores de "entidad desconectada".
		Usuario autorReal = usuarioRepository.findById(mensaje.getUsuario().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));

		Tema temaReal = temaRepository.findById(mensaje.getTema().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El tema no existe"));

		// Vinculamos el mensaje a las entidades reales obtenidas
		mensaje.setUsuario(autorReal);
		mensaje.setTema(temaReal);

		// Actualizamos el contador estadístico del Tema
		int totalActual = temaReal.getContadorMensajes();
		temaReal.setContadorMensajes(totalActual + 1);
		temaRepository.save(temaReal);

		return mensajeRepository.save(mensaje);
	}

	public List<Mensaje> listarTodos() {
		return mensajeRepository.findAll();
	}
    
	public List<Mensaje> obtenerMensajesDeUnTema(int temaId) {
		return mensajeRepository.findByTemaIdentificadorOrderByFechaCreacionAsc(temaId);
	}
	
	/**
	 * Elimina un mensaje del foro.
	 * Antes de borrarlo, limpia sus dependencias (likes) y ajusta las estadísticas del Tema.
	 */
	public void eliminarMensaje(Integer id) {
		Mensaje mensaje = mensajeRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("El mensaje no existe"));
		
		Tema tema = mensaje.getTema();
		
		// Si el tema existe, restamos 1 al contador para mantener las estadísticas cuadras
		if (tema != null && tema.getContadorMensajes() > 0) {
			tema.setContadorMensajes(tema.getContadorMensajes() - 1);
			temaRepository.save(tema);
		}

		// Ejecutamos SQL nativo para borrar todos los 'Likes' asociados a este mensaje.
		// Esto es necesario para no violar la restricción de clave foránea (FK_LIKES_MENSAJE) 
		// en la base de datos antes de borrar el mensaje principal.
		jdbcTemplate.update("DELETE FROM t_likes WHERE mensaje_id = ?", id);

		mensajeRepository.delete(mensaje);
	}

	/**
	 * Modifica el contenido de texto de un mensaje existente.
	 */
	public Mensaje editarMensaje(Integer id, String nuevoContenido) {
		Mensaje mensaje = mensajeRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("El mensaje no existe"));
		
		mensaje.setContenido(nuevoContenido);
		
		// Actualizamos la fecha para indicar visualmente que el mensaje ha sido editado
		mensaje.setFechaActualizacion(LocalDate.now());
		
		return mensajeRepository.save(mensaje);
	}
	
}

