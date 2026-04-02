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

		if (baneadoRepository.existsByUsuarioIdentificador(usuario.getIdentificador())) {
			throw new RuntimeException("El usuario ya esta baneado");
		}

		// 2. Comprobar que no estemos baneando a un ADMIN
		if (usuario.getRol().name().equals("ADMIN")) {
			throw new RuntimeException("No puedes banear a un administrador");
		}

		baneo.setUsuario(usuario);

		return baneadoRepository.save(baneo);
	}

	public List<UsuarioBaneado> obtenerTodosLosBaneos() {
	    return baneadoRepository.findAll();
	}
}