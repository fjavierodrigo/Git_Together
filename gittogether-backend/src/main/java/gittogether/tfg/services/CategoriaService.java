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
		if (categoria.getSlug() == null || categoria.getSlug().isEmpty()) {
			categoria.setSlug(generarSlug(categoria.getNombre()));
		}
		
		if (categoria.getDescripcion() == null) {
			categoria.setDescripcion("");
		}
		
		if (categoriaRepository.existsByNombre(categoria.getNombre())
				|| categoriaRepository.existsBySlug(categoria.getSlug())) {
			throw new RuntimeException("La categoria ya existe");
		}
		return categoriaRepository.save(categoria);
	}

	private String generarSlug(String nombre) {
		if (nombre == null) return "";
		String base = java.text.Normalizer.normalize(nombre, java.text.Normalizer.Form.NFD)
				.replaceAll("\\p{M}", "") // Quita acentos
				.toLowerCase()
				.replaceAll("[^a-z0-9 ]", "")
				.trim()
				.replaceAll("\\s+", "-");
		return base;
	}

	public List<Categoria> obtenerTodas() {
		return categoriaRepository.findAll();
	}

	public Categoria obtenerPorId(int id) {
		return categoriaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("La categoría con ID " + id + " no existe"));
	}
	
	public void eliminarCategoria(Integer id) {
		if (!categoriaRepository.existsById(id)) {
			throw new RuntimeException("La categoría no existe");
		}
		categoriaRepository.deleteById(id);
	}

	public Categoria editarCategoria(Integer id, String nuevoNombre) {
		Categoria categoria = categoriaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("La categoría no existe"));
		
		categoria.setNombre(nuevoNombre);
		return categoriaRepository.save(categoria);
	}
}
