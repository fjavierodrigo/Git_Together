package gittogether.tfg.repositories;

import gittogether.tfg.entities.MensajePrivado;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MensajePrivadoRepository extends JpaRepository<MensajePrivado, Integer> {

	List<MensajePrivado> findByReceptorIdentificadorOrderByFechaInicioDesc(int receptorId);

}