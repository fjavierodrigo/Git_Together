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
}