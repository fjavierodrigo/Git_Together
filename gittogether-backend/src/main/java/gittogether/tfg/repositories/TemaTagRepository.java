package gittogether.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import gittogether.tfg.entities.TemaTag;
import java.util.List;

@Repository
public interface TemaTagRepository extends JpaRepository<TemaTag, Integer> {
    List<TemaTag> findByTemaIdentificador(int temaId);
    List<TemaTag> findByTagNombre(String nombreTag);
    
    // Para temas relacionados: busca relaciones de otros temas que compartan los mismos tags
    List<TemaTag> findByTagIdentificadorInAndTemaIdentificadorNot(List<Integer> tagIds, int temaId);
}
