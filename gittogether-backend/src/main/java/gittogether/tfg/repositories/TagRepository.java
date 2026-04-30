package gittogether.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import gittogether.tfg.entities.Tag;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Integer> {
    Optional<Tag> findByNombreIgnoreCase(String nombre);
    java.util.List<Tag> findByNombreContainingIgnoreCase(String nombre);
}
