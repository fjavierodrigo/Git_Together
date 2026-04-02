package gittogether.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gittogether.tfg.entities.Likes;
import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.entities.Usuario;

@Repository
public interface LikesRepository extends JpaRepository<Likes, Integer> {

	boolean existsByUsuarioIdentificadorAndMensajeIdentificador(int usuarioId, int mensajeId);

	boolean existsByUsuarioAndMensaje(Usuario usuario, Mensaje mensaje);

	// Cuenta cuántos likes tiene un mensaje en concreto
	int countByMensajeIdentificador(int mensajeId);

}