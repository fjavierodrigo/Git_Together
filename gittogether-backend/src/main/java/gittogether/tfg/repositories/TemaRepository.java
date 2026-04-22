package gittogether.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; // ESTE ES EL IMPORT CRUCIAL
import gittogether.tfg.entities.Tema;
import java.util.List;

public interface TemaRepository extends JpaRepository<Tema, Integer> {

	// Usamos @EntityGraph para traer usuario y categoria en una sola consulta
	// Cambiamos el retorno a Page para que funcione el .getContent() en el Service
	@EntityGraph(attributePaths = { "usuario", "categoria" })
	Page<Tema> findAll(Pageable pageable);

	// También optimizamos la búsqueda por categoría con EntityGraph
	@EntityGraph(attributePaths = { "usuario", "categoria" })
	List<Tema> findByCategoriaIdentificador(int identificador);

    @EntityGraph(attributePaths = { "usuario", "categoria" })
    java.util.Optional<Tema> findBySlug(String slug);

    int countByUsuarioIdentificador(int usuarioId);
}
