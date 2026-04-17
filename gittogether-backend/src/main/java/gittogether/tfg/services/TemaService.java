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
        // 1. Asignamos los valores por defecto de un tema nuevo
        tema.setVisitas(0);
        tema.setContadorMensajes(0);
        tema.setAbierto(true);
        tema.setFechaCreacion(LocalDate.now());

        // 2. Buscamos al usuario real en la Base de Datos
        Usuario autorReal = usuarioRepository.findById(tema.getUsuario().getIdentificador())
                .orElseThrow(() -> new RuntimeException("El usuario autor no existe"));

        // 3. Buscamos la categoría real en la Base de Datos
        Categoria categoriaReal = categoriaRepository.findById(tema.getCategoria().getIdentificador())
                .orElseThrow(() -> new RuntimeException("La categoría no existe"));

        // 4. Se los asignamos al tema para que devuelva el JSON completo
        tema.setUsuario(autorReal);
        tema.setCategoria(categoriaReal);

        return temaRepository.save(tema);
    }

    public List<Tema> listarTemas() {
        // Cargamos solo los 20 más visitados para que la respuesta sea instantánea
        // Importante: Asegúrate de usar "JOIN FETCH" en tu TemaRepository para evitar
        // el N+1
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
}