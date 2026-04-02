package gittogether.tfg.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gittogether.tfg.entities.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

	// Spring deduce la consulta: SELECT * FROM T_CATEGORIA WHERE slug = ?
	Optional<Categoria> findBySlug(String slug);

	// Comprobar si existe antes de registrar
	boolean existsByNombre(String nombre);
	
	boolean existsBySlug(String slug);

}
