package gittogether.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gittogether.tfg.entities.Mensaje;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Integer> {

    List<Mensaje> findByTemaIdentificadorOrderByFechaCreacionDesc(int temaId);

    List<Mensaje> findByUsuarioIdentificador(int usuarioId);

	// Spring crea el SQL buscando por el ID del tema y ordenando por fecha
	List<Mensaje> findByTemaIdentificadorOrderByFechaCreacionAsc(int temaId);

}