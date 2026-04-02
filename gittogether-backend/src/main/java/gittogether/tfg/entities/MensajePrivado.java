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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "T_MENSAJE_PRIVADO")
public class MensajePrivado {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@Column(name = "contenido", length = 255, nullable = false)
	private String contenido;

	@Column(name = "leido", nullable = false)
	private boolean leido;

	@Column(name = "fecha_inicio", nullable = false)
	private LocalDate fechaInicio;

	@ManyToOne
	@JsonIgnoreProperties({ "password", "avatar", "fechaRegistro", "rol" })
	@JoinColumn(name = "emisor_usuario_id", foreignKey = @ForeignKey(name = "FK_MENSAJE_PRIVADO_EMISOR"), nullable = false)
	private Usuario emisor;

	@ManyToOne
	@JsonIgnoreProperties({ "password", "avatar", "fechaRegistro", "rol" })
	@JoinColumn(name = "receptor_usuario_id", foreignKey = @ForeignKey(name = "FK_MENSAJE_PRIVADO_RECEPTOR"), nullable = false)
	private Usuario receptor;

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

	public boolean isLeido() {
		return leido;
	}

	public void setLeido(boolean leido) {
		this.leido = leido;
	}

	public LocalDate getFechaInicio() {
		return fechaInicio;
	}

	public void setFechaInicio(LocalDate fechaInicio) {
		this.fechaInicio = fechaInicio;
	}

	public Usuario getEmisor() {
		return emisor;
	}

	public void setEmisor(Usuario emisor) {
		this.emisor = emisor;
	}

	public Usuario getReceptor() {
		return receptor;
	}

	public void setReceptor(Usuario receptor) {
		this.receptor = receptor;
	}

	@Override
	public String toString() {
		return "MensajePrivado [identificador=" + identificador + ", contenido=" + contenido + ", leido=" + leido
				+ ", fechaInicio=" + fechaInicio + ", Emisor=" + emisor + ", Receptor=" + receptor + "]";
	}

}
