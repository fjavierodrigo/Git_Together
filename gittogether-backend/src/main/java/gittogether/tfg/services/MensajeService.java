package gittogether.tfg.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

	public Mensaje crearMensaje(Mensaje mensaje) {
		// 1. Fechas automáticas
		mensaje.setFechaCreacion(LocalDate.now());
		mensaje.setFechaActualizacion(null);

		// 2. Buscamos al usuario real en AWS para vincular la FK
		Usuario autorReal = usuarioRepository.findById(mensaje.getUsuario().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));

		// 3. Buscamos el tema real en AWS
		Tema temaReal = temaRepository.findById(mensaje.getTema().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El tema no existe"));

		// 4. Inyectamos los objetos reales antes de guardar
		mensaje.setUsuario(autorReal);
		mensaje.setTema(temaReal);

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
}