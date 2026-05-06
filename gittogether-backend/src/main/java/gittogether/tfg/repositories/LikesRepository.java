package gittogether.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import gittogether.tfg.entities.Likes;
import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.entities.Tema;
import gittogether.tfg.entities.Usuario;
import java.util.List;
import java.util.Optional;

@Repository
public interface LikesRepository extends JpaRepository<Likes, Integer> {

	boolean existsByUsuarioAndMensaje(Usuario usuario, Mensaje mensaje);

	boolean existsByUsuarioAndTema(Usuario usuario, Tema tema);

	@Transactional
	@Modifying
	void deleteByUsuarioAndMensaje(Usuario usuario, Mensaje mensaje);

	@Transactional
	@Modifying
	void deleteByUsuarioAndTema(Usuario usuario, Tema tema);

	Optional<Likes> findByUsuarioAndMensaje(Usuario usuario, Mensaje mensaje);

	Optional<Likes> findByUsuarioAndTema(Usuario usuario, Tema tema);

	@Query("SELECT l.mensaje.identificador FROM Likes l WHERE l.usuario.identificador = :usuarioId AND l.mensaje.tema.identificador = :temaId")
	List<Integer> findMensajeIdsByUsuarioAndTemaId(@Param("usuarioId") int usuarioId, @Param("temaId") int temaId);

	@Query("SELECT l.tema.identificador FROM Likes l WHERE l.usuario.identificador = :usuarioId AND l.tema.identificador = :temaId")
	Optional<Integer> findTemaLikeByUsuario(@Param("usuarioId") int usuarioId, @Param("temaId") int temaId);

	// Cuenta cuántos likes tiene un mensaje en concreto
	int countByMensajeIdentificador(int mensajeId);

	// Cuenta cuántos likes tiene un tema en concreto
	int countByTemaIdentificador(int temaId);

}