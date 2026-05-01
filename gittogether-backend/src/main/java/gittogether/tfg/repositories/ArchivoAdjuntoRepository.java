package gittogether.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gittogether.tfg.entities.ArchivoAdjunto;

@Repository
public interface ArchivoAdjuntoRepository extends JpaRepository<ArchivoAdjunto, Integer> {
}
