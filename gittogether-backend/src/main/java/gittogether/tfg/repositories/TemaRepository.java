package gittogether.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gittogether.tfg.entities.Tema;

@Repository
public interface TemaRepository extends JpaRepository<Tema, Integer> {

	boolean existsByTitulo(String titulo);

	List<Tema> findByTituloContainingIgnoreCase(String titulo);

	// Spring crea el SQL: SELECT * FROM T_TEMA WHERE categoria_id = ?
	List<Tema> findByCategoriaIdentificador(int categoriaId);

}