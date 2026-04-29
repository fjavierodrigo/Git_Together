package gittogether.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import gittogether.tfg.entities.Tema;
import java.util.List;
import java.util.Optional;

public interface TemaRepository extends JpaRepository<Tema, Integer> {

    @EntityGraph(attributePaths = { "usuario", "categoria", "tags", "tags.tag" })
    Page<Tema> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "usuario", "categoria", "tags", "tags.tag" })
    List<Tema> findByCategoriaIdentificador(int identificador);

    @EntityGraph(attributePaths = { "usuario", "categoria", "tags", "tags.tag" })
    Optional<Tema> findBySlug(String slug);

    int countByUsuarioIdentificador(int usuarioId);
}
