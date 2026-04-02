package gittogether.tfg.entities;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import gittogether.tfg.entities.enums.TipoReporte;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "T_REPORTE")
public class Reporte {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@Column(name = "razon", length = 255, nullable = false)
	private String razon;

	@Enumerated(EnumType.STRING)
	@Column(name = "estado", nullable = false)
	private TipoReporte estado;

	@Column(name = "fecha", nullable = false)
	private LocalDate fecha;

	@ManyToOne
	@JsonIgnoreProperties({ "tema", "usuario" }) // No necesitamos toda la jerarquía del mensaje reportado aquí
	@JoinColumn(name = "mensaje_id", foreignKey = @ForeignKey(name = "FK_REPORTE_MENSAJE"), nullable = false)
	private Mensaje mensaje;

	@ManyToOne
	@JoinColumn(name = "usuario_id", foreignKey = @ForeignKey(name = "FK_REPORTE_USUARIO"), nullable = false)
	private Usuario usuario;

	public int getIdentificador() {
		return identificador;
	}

	public void setIdentificador(int identificador) {
		this.identificador = identificador;
	}

	public String getRazon() {
		return razon;
	}

	public void setRazon(String razon) {
		this.razon = razon;
	}

	public TipoReporte getEstado() {
		return estado;
	}

	public void setEstado(TipoReporte estado) {
		this.estado = estado;
	}

	public LocalDate getFecha() {
		return fecha;
	}

	public void setFecha(LocalDate fecha) {
		this.fecha = fecha;
	}

	public Mensaje getMensaje() {
		return mensaje;
	}

	public void setMensaje(Mensaje mensaje) {
		this.mensaje = mensaje;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	@Override
	public String toString() {
		return "Reporte [identificador=" + identificador + ", razon=" + razon + ", estado=" + estado + ", fecha="
				+ fecha + ", mensaje=" + mensaje + ", usuario=" + usuario + "]";
	}

}
