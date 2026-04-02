package gittogether.tfg.entities;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "T_MENSAJE")
public class Mensaje {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@Column(name = "contenido", length = 255, nullable = false)
	private String contenido;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDate fechaCreacion;

	@Column(name = "fecha_actualizado", nullable = true)
	private LocalDate fechaActualizacion;

	// Evita datos innecesarios del autor
	@JsonIgnoreProperties("categoria")
	@ManyToOne
	@JoinColumn(name = "tema_id", foreignKey = @ForeignKey(name = "FK_MENSAJE_TEMA"), nullable = false)
	private Tema tema;

	// Evita que al ver un mensaje se cargue todo el árbol de categorías
	@JsonIgnoreProperties({ "password", "avatar", "fechaRegistro" })
	@ManyToOne
	@JoinColumn(name = "usuario_id", foreignKey = @ForeignKey(name = "FK_MENSAJE_USUARIO"), nullable = false)
	private Usuario usuario;

	public int getIdentificador() {
		return identificador;
	}

	public void setIdentificador(int identificador) {
		this.identificador = identificador;
	}

	public String getContenido() {
		return contenido;
	}

	public void setContenido(String contenido) {
		this.contenido = contenido;
	}

	public LocalDate getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDate fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public LocalDate getFechaActualizacion() {
		return fechaActualizacion;
	}

	public void setFechaActualizacion(LocalDate fechaActualizacion) {
		this.fechaActualizacion = fechaActualizacion;
	}

	public Tema getTema() {
		return tema;
	}

	public void setTema(Tema tema) {
		this.tema = tema;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	@Override
	public String toString() {
		return "Mensaje [identificador=" + identificador + ", contenido=" + contenido + ", fechaCreacion="
				+ fechaCreacion + ", fechaActualizacion=" + fechaActualizacion + ", tema=" + tema + ", usuario="
				+ usuario + "]";
	}

}
