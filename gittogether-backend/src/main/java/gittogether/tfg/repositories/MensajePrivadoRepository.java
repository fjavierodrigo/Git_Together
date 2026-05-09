package gittogether.tfg.repositories;

import gittogether.tfg.entities.MensajePrivado;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MensajePrivadoRepository extends JpaRepository<MensajePrivado, Integer> {

	List<MensajePrivado> findByReceptorIdentificadorOrderByFechaEnvioDesc(int receptorId);

    @Query("SELECT m FROM MensajePrivado m WHERE (m.emisor.identificador = :u1 AND m.receptor.identificador = :u2) OR (m.emisor.identificador = :u2 AND m.receptor.identificador = :u1) ORDER BY m.fechaEnvio ASC")
    List<MensajePrivado> findChatHistory(@Param("u1") int u1, @Param("u2") int u2);

}