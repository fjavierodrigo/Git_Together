package gittogether.tfg.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gittogether.tfg.entities.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

	// Spring deduce la consulta: SELECT * FROM T_USUARIO WHERE email = ? or nombre = ?
	Optional<Usuario> findByNombreOrEmail(String nombre, String email);

	boolean existsByNombre(String nombre);
	
	boolean existsByEmail(String email);

}
