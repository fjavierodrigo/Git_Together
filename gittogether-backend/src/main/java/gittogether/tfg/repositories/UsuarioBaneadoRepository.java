package gittogether.tfg.repositories;

import gittogether.tfg.entities.UsuarioBaneado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioBaneadoRepository extends JpaRepository<UsuarioBaneado, Integer> {
	boolean existsByUsuarioIdentificador(int usuarioId); // (para saber si alguien ya está baneado)
}