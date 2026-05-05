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
		List<UsuarioBaneado> baneos = baneadoRepository.encontrarPorUsuarioId(usuarioId);
		System.out.println("[BaneoService] Buscando baneos para ID " + usuarioId + ". Encontrados: " + baneos.size());
		
		return baneos.stream()
				.filter(baneo -> {
					boolean activo = baneo.getFechaFin() == null || 
						   baneo.getFechaFin().isAfter(LocalDate.now()) || 
						   baneo.getFechaFin().isEqual(LocalDate.now());
					
					System.out.println("[BaneoService] Comprobando baneo ID " + baneo.getIdentificador() + 
									   ": Fin=" + baneo.getFechaFin() + " | Activo=" + activo);
					return activo;
				})
				.findFirst()
				.orElse(null);
	}
}