package gittogether.tfg.services;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import gittogether.tfg.entities.Categoria;
import gittogether.tfg.entities.Tema;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.entities.Tag;
import gittogether.tfg.entities.TemaTag;
import gittogether.tfg.repositories.CategoriaRepository;
import gittogether.tfg.repositories.TemaRepository;
import gittogether.tfg.repositories.UsuarioRepository;
import gittogether.tfg.repositories.TagRepository;
import gittogether.tfg.repositories.TemaTagRepository;

@Service
public class TemaService {

    @Autowired
    private TemaRepository temaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private TemaTagRepository temaTagRepository;

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

        // Guardamos el tema primero para tener su ID
        Tema temaGuardado = temaRepository.save(tema);

        // Manejo de tags: Si vienen tags (objetos TemaTag con nombres de tags)
        if (tema.getTags() != null && !tema.getTags().isEmpty()) {
            for (TemaTag tt : tema.getTags()) {
                if (tt.getTag() != null && tt.getTag().getNombre() != null) {
                    String nombreTag = tt.getTag().getNombre().trim().toLowerCase();
                    Tag tagReal = tagRepository.findByNombre(nombreTag)
                        .orElseGet(() -> {
                            Tag nuevo = new Tag();
                            nuevo.setNombre(nombreTag);
                            return tagRepository.save(nuevo);
                        });
                    
                    TemaTag relacion = new TemaTag();
                    relacion.setTema(temaGuardado);
                    relacion.setTag(tagReal);
                    temaTagRepository.save(relacion);
                }
            }
        }

        return temaGuardado;
    }

    public List<Tema> obtenerTemasPorTag(String nombreTag) {
        List<TemaTag> relaciones = temaTagRepository.findByTagNombre(nombreTag.toLowerCase());
        return relaciones.stream().map(TemaTag::getTema).collect(Collectors.toList());
    }

    public List<Tema> obtenerTemasRelacionados(int temaId) {
        List<TemaTag> misTags = temaTagRepository.findByTemaIdentificador(temaId);
        if (misTags.isEmpty()) return new ArrayList<>();

        List<Integer> tagIds = misTags.stream()
            .map(tt -> tt.getTag().getIdentificador())
            .collect(Collectors.toList());

        List<TemaTag> relacionesRelacionadas = temaTagRepository.findByTagIdentificadorInAndTemaIdentificadorNot(tagIds, temaId);
        
        // Usamos un Set para asegurar que no devolvemos el mismo tema varias veces
        // (por ejemplo, si comparte dos etiquetas diferentes con el tema actual)
        Set<Tema> temasUnicos = relacionesRelacionadas.stream()
            .map(TemaTag::getTema)
            .collect(Collectors.toSet());

        return temasUnicos.stream()
            .limit(5)
            .collect(Collectors.toList());
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
        Optional<Tema> temaOpt = temaRepository.findBySlug(slug);
        temaOpt.ifPresent(tema -> {
            tema.setVisitas(tema.getVisitas() + 1);
            temaRepository.save(tema);
        });
        return temaOpt;
    }

    public void eliminarTema(Integer id) {
        if (!temaRepository.existsById(id)) {
            throw new RuntimeException("El tema no existe");
        }
        temaRepository.deleteById(id);
    }

    public Tema editarTema(Integer id, String nuevoTitulo, String nuevaDescripcion) {
        Tema tema = temaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El tema no existe"));

        if (nuevoTitulo != null)
            tema.setTitulo(nuevoTitulo);
        if (nuevaDescripcion != null)
            tema.setDescripcion(nuevaDescripcion);

        return temaRepository.save(tema);
    }
}
