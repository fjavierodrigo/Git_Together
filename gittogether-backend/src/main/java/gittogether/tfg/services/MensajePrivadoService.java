package gittogether.tfg.services;

import gittogether.tfg.entities.MensajePrivado;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.repositories.MensajePrivadoRepository;
import gittogether.tfg.repositories.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MensajePrivadoService {

	@Autowired
	private MensajePrivadoRepository mensajeRepository;

	@Autowired
	private UsuarioRepository usuarioRepository; // Añadimos esto para buscar usuarios

	public MensajePrivado enviarMensaje(MensajePrivado mensaje) {
		mensaje.setFechaInicio(LocalDate.now());
		mensaje.setLeido(false);

		// 1. Buscamos el emisor completo en la base de datos
		Usuario emisorReal = usuarioRepository.findById(mensaje.getEmisor().getIdentificador())
				.orElseThrow(() -> new RuntimeException("Emisor no encontrado"));

		// 2. Buscamos el receptor completo
		Usuario receptorReal = usuarioRepository.findById(mensaje.getReceptor().getIdentificador())
				.orElseThrow(() -> new RuntimeException("Receptor no encontrado"));

		// 3. Se los asignamos al mensaje
		mensaje.setEmisor(emisorReal);
		mensaje.setReceptor(receptorReal);

		// 4. Guardamos
		return mensajeRepository.save(mensaje);
	}

	public List<MensajePrivado> obtenerBandejaEntrada(int receptorId) {
		return mensajeRepository.findByReceptorIdentificadorOrderByFechaInicioDesc(receptorId);
	}
}