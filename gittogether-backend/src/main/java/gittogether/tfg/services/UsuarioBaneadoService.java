package gittogether.tfg.services;

import gittogether.tfg.entities.Usuario;
import gittogether.tfg.entities.UsuarioBaneado;
import gittogether.tfg.repositories.UsuarioBaneadoRepository;
import gittogether.tfg.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UsuarioBaneadoService {

	@Autowired
	private UsuarioBaneadoRepository baneadoRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;

	public UsuarioBaneado banearUsuario(UsuarioBaneado baneo) {
		baneo.setFechaInicio(LocalDate.now());

		// 1. Buscamos al usuario real
		Usuario usuario = usuarioRepository.findById(baneo.getUsuario().getIdentificador())
				.orElseThrow(() -> new RuntimeException("El usuario que intentas banear no existe"));

		// 2. Comprobar si YA tiene un baneo activo actualmente
		if (obtenerBaneoActivo(usuario.getIdentificador()) != null) {
			throw new RuntimeException("El usuario ya tiene un baneo activo");
		}

		// 3. Comprobar que no estemos baneando a un ADMIN (Insensible a mayúsculas)
		if (usuario.getRol().name().equalsIgnoreCase("Admin")) {
			throw new RuntimeException("No puedes banear a un administrador");
		}

		baneo.setUsuario(usuario);

		return baneadoRepository.save(baneo);
	}

	public List<UsuarioBaneado> obtenerTodosLosBaneos() {
		return baneadoRepository.findAll();
	}

	public UsuarioBaneado obtenerBaneoActivo(int usuarioId) {
		return baneadoRepository.encontrarBaneoActivo(usuarioId).orElse(null);
	}

	public void eliminarBaneo(int baneoId) {
		baneadoRepository.deleteById(baneoId);
	}

	public UsuarioBaneado actualizarBaneo(int baneoId, UsuarioBaneado nuevosDatos) {
		UsuarioBaneado baneoExistente = baneadoRepository.findById(baneoId)
				.orElseThrow(() -> new RuntimeException("El baneo no existe"));
		
		baneoExistente.setRazon(nuevosDatos.getRazon());
		baneoExistente.setFechaFin(nuevosDatos.getFechaFin());
		baneoExistente.setEvidencia(nuevosDatos.getEvidencia());
		
		return baneadoRepository.save(baneoExistente);
	}

	public void reclamarBaneo(int usuarioId, String mensaje) {
		UsuarioBaneado baneoActivo = obtenerBaneoActivo(usuarioId);
		if (baneoActivo == null) {
			throw new RuntimeException("No tienes un baneo activo sobre el cual reclamar");
		}
		baneoActivo.setReclamacion(mensaje);
		baneoActivo.setRevisado(false);
		baneadoRepository.save(baneoActivo);
	}

	public List<UsuarioBaneado> obtenerReclamacionesPendientes() {
		return baneadoRepository.encontrarReclamacionesPendientes();
	}

	public void marcarReclamacionComoRevisada(int baneoId) {
		UsuarioBaneado baneo = baneadoRepository.findById(baneoId)
				.orElseThrow(() -> new RuntimeException("Baneo no encontrado"));
		baneo.setRevisado(true);
		baneadoRepository.save(baneo);
	}
}