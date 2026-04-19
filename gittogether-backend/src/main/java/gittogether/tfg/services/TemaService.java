package gittogether.tfg.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import gittogether.tfg.entities.Categoria;
import gittogether.tfg.entities.Tema;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.repositories.CategoriaRepository;
import gittogether.tfg.repositories.TemaRepository;
import gittogether.tfg.repositories.UsuarioRepository;

@Service
public class TemaService {

    @Autowired
    private TemaRepository temaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    public Tema crearTema(Tema tema) {
        tema.setVisitas(0);
        tema.setContadorMensajes(0);
        tema.setAbierto(true);
        tema.setFechaCreacion(LocalDate.now());

        Usuario autorReal = usuarioRepository.findById(tema.getUsuario().getIdentificador())
                .orElseThrow(() -> new RuntimeException("El usuario autor no existe"));

        Categoria categoriaReal = categoriaRepository.findById(tema.getCategoria().getIdentificador())
                .orElseThrow(() -> new RuntimeException("La categoría no existe"));

        tema.setUsuario(autorReal);
        tema.setCategoria(categoriaReal);

        return temaRepository.save(tema);
    }

    public List<Tema> listarTemas() {
        return temaRepository.findAll(PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "visitas"))).getContent();
    }

    public List<Tema> obtenerTemasPorCategoria(int categoriaId) {
        return temaRepository.findByCategoriaIdentificador(categoriaId);
    }

    public Optional<Tema> obtenerTemaPorId(int id) {
        return temaRepository.findById(id);
    }

    public Optional<Tema> obtenerTemaPorSlug(String slug) {
        return temaRepository.findBySlug(slug);
    }
    
	public void eliminarTema(Integer id) {
		if (!temaRepository.existsById(id)) {
			throw new RuntimeException("El tema no existe");
		}
		temaRepository.deleteById(id);
	}

	public Tema editarTema(Integer id, String nuevoTitulo) {
		Tema tema = temaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("El tema no existe"));
		
		tema.setTitulo(nuevoTitulo);
		return temaRepository.save(tema);
	}
}
