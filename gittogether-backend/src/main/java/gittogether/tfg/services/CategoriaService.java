package gittogether.tfg.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import gittogether.tfg.entities.Categoria;
import gittogether.tfg.repositories.CategoriaRepository;

@Service
public class CategoriaService {

	@Autowired
	private CategoriaRepository categoriaRepository;

	public Categoria registrarCategoria(Categoria categoria) {
		if (categoriaRepository.existsByNombre(categoria.getNombre())
				|| categoriaRepository.existsBySlug(categoria.getSlug())) {
			throw new RuntimeException("La categoria ya existe");
		}
		// categoria.setOrdenVisual();
		return categoriaRepository.save(categoria);
	}

	// Método para obtener TODAS las categorías
	public List<Categoria> obtenerTodas() {
		// findAll() busca en la tabla y las devuelve todas
		return categoriaRepository.findAll();
	}

	// Método para obtener UNA categoría por su ID
	public Categoria obtenerPorId(int id) {
		// findById() busca una, y si no la encuentra, lanza nuestro error
		return categoriaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("La categoría con ID " + id + " no existe"));
	}
}