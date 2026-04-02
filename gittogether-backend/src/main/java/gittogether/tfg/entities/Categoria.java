package gittogether.tfg.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@NoArgsConstructor // OBLIGATORIO para JPA (Constructor vacío)
@AllArgsConstructor // Útil para crear usuarios rápidamente
@Entity
@Table(name = "T_CATEGORIA")
public class Categoria {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@Column(name = "nombre", length = 255, nullable = false, unique = true)
	private String nombre;

	@Column(name = "descripcion", length = 255, nullable = false)
	private String descripcion;

	@Column(name = "slug", length = 255, nullable = false, unique = true)
	private String slug;

	@Column(name = "orden_visual", nullable = false)
	private int ordenVisual;

	public int getIdentificador() {
		return identificador;
	}

	public void setIdentificador(int identificador) {
		this.identificador = identificador;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public String getSlug() {
		return slug;
	}

	public void setSlug(String slug) {
		this.slug = slug;
	}

	public int getOrdenVisual() {
		return ordenVisual;
	}

	public void setOrdenVisual(int ordenVisual) {
		this.ordenVisual = ordenVisual;
	}

	@Override
	public String toString() {
		return "Categoria [identificador=" + identificador + ", nombre=" + nombre + ", descripcion=" + descripcion
				+ ", slug=" + slug + ", ordenVisual=" + ordenVisual + "]";
	}

}
