package gittogether.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import gittogether.tfg.entities.Likes;
import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.entities.Usuario;
import java.util.List;
import java.util.Optional;

@Repository
public interface LikesRepository extends JpaRepository<Likes, Integer> {

	boolean existsByUsuarioAndMensaje(Usuario usuario, Mensaje mensaje);

	Optional<Likes> findByUsuarioAndMensaje(Usuario usuario, Mensaje mensaje);

	@Query("SELECT l.mensaje.identificador FROM Likes l WHERE l.usuario.identificador = :usuarioId AND l.mensaje.tema.identificador = :temaId")
	List<Integer> findMensajeIdsByUsuarioAndTemaId(@Param("usuarioId") int usuarioId, @Param("temaId") int temaId);

	// Cuenta cuántos likes tiene un mensaje en concreto
	int countByMensajeIdentificador(int mensajeId);

}