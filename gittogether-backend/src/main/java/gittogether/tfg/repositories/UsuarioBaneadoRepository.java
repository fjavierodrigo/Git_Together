package gittogether.tfg.repositories;

import gittogether.tfg.entities.UsuarioBaneado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UsuarioBaneadoRepository extends JpaRepository<UsuarioBaneado, Integer> {
	boolean existsByUsuarioIdentificador(int usuarioId);
	
	@Query("SELECT b FROM UsuarioBaneado b WHERE b.usuario.identificador = :usuarioId")
	java.util.List<UsuarioBaneado> encontrarPorUsuarioId(@Param("usuarioId") int usuarioId);

	@Query("SELECT b FROM UsuarioBaneado b WHERE b.reclamacion IS NOT NULL AND b.revisado = false")
	java.util.List<UsuarioBaneado> encontrarReclamacionesPendientes();

	@Query("SELECT b FROM UsuarioBaneado b WHERE b.usuario.identificador = :usuarioId AND (b.fechaFin IS NULL OR b.fechaFin >= CURRENT_DATE)")
	java.util.Optional<UsuarioBaneado> encontrarBaneoActivo(@Param("usuarioId") int usuarioId);
}