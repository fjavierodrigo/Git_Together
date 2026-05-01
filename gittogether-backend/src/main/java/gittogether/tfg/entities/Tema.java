package gittogether.tfg.entities;

import java.time.LocalDate;
import java.util.Set;
import java.util.HashSet;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "T_TEMA")
public class Tema {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@Column(name = "titulo", length = 255, nullable = false)
	private String titulo;

	@Column(name = "descripcion", columnDefinition = "TEXT")
	private String descripcion;

	@Column(name = "slug", length = 255, nullable = false)
	private String slug;

	@Column(name = "visitas", nullable = false)
	private int visitas;

	@Column(name = "contador_mensajes", nullable = false)
	private int contadorMensajes;

	@Column(name = "abierto", nullable = false)
	private boolean abierto;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDate fechaCreacion;

	@ManyToOne
	@JoinColumn(name = "categoria_id", foreignKey = @ForeignKey(name = "FK_TEMA_CATEGORIA"), nullable = false)
	private Categoria categoria;

	@ManyToOne
	@JoinColumn(name = "usuario_id", foreignKey = @ForeignKey(name = "FK_TEMA_USUARIO"), nullable = false)
	private Usuario usuario;

	@OneToMany(mappedBy = "tema")
	@JsonIgnoreProperties("tema")
	private Set<TemaTag> tags = new HashSet<>();

	@OneToMany(mappedBy = "tema", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<ArchivoAdjunto> archivos = new java.util.ArrayList<>();

	public int getIdentificador() {
		return identificador;
	}

	public void setIdentificador(int identificador) {
		this.identificador = identificador;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
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

	public int getVisitas() {
		return visitas;
	}

	public void setVisitas(int visitas) {
		this.visitas = visitas;
	}

	public int getContadorMensajes() {
		return contadorMensajes;
	}

	public void setContadorMensajes(int contadorMensajes) {
		this.contadorMensajes = contadorMensajes;
	}

	public boolean isAbierto() {
		return abierto;
	}

	public void setAbierto(boolean abierto) {
		this.abierto = abierto;
	}

	public LocalDate getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDate fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public Categoria getCategoria() {
		return categoria;
	}

	public void setCategoria(Categoria categoria) {
		this.categoria = categoria;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public Set<TemaTag> getTags() {
		return tags;
	}

	public void setTags(Set<TemaTag> tags) {
		this.tags = tags;
	}

	public java.util.List<ArchivoAdjunto> getArchivos() {
		return archivos;
	}

	public void setArchivos(java.util.List<ArchivoAdjunto> archivos) {
		this.archivos = archivos;
	}

	@Override
	public String toString() {
		return "Tema [identificador=" + identificador + ", titulo=" + titulo + ", descripcion=" + descripcion
				+ ", slug=" + slug + ", visitas=" + visitas + ", contadorMensajes=" + contadorMensajes + ", abierto="
				+ abierto + ", fechaCreacion=" + fechaCreacion + ", categoria=" + categoria + ", usuario=" + usuario
				+ "]";
	}

}
