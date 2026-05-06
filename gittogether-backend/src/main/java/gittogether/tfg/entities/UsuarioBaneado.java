package gittogether.tfg.entities;

import java.time.LocalDate;

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
@Table(name = "T_USUARIO_BANEADO")
public class UsuarioBaneado {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@Column(name = "razon", length = 255, nullable = true)
	private String razon;

	@Column(name = "fecha_inicio", nullable = false)
	private LocalDate fechaInicio;

	@Column(name = "fecha_fin", nullable = true)
	private LocalDate fechaFin;

	@ManyToOne
	@JoinColumn(name = "usuario_id", foreignKey = @ForeignKey(name = "FK_USUARIO_BANEADO_USUARIO"), nullable = false)
	private Usuario usuario;

		@Column(name = "baneado_por", length = 255)
	private String baneadoPor;

	@Column(name = "evidencia", columnDefinition = "TEXT")
	private String evidencia;

	@Column(name = "revisado")
	private boolean revisado = false;

	@Column(name = "reclamacion", columnDefinition = "TEXT")
	private String reclamacion;

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

	public LocalDate getFechaInicio() {
		return fechaInicio;
	}

	public void setFechaInicio(LocalDate fechaInicio) {
		this.fechaInicio = fechaInicio;
	}

	public LocalDate getFechaFin() {
		return fechaFin;
	}

	public void setFechaFin(LocalDate fechaFin) {
		this.fechaFin = fechaFin;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public String getBaneadoPor() {
		return baneadoPor;
	}

	public void setBaneadoPor(String baneadoPor) {
		this.baneadoPor = baneadoPor;
	}

	public String getEvidencia() {
		return evidencia;
	}

	public void setEvidencia(String evidencia) {
		this.evidencia = evidencia;
	}

	public boolean isRevisado() {
		return revisado;
	}

	public void setRevisado(boolean revisado) {
		this.revisado = revisado;
	}

	public String getReclamacion() {
		return reclamacion;
	}

	public void setReclamacion(String reclamacion) {
		this.reclamacion = reclamacion;
	}

	@Override
	public String toString() {
		return "UsuarioBaneado [identificador=" + identificador + ", razon=" + razon + ", fechaInicio=" + fechaInicio
				+ ", fechaFin=" + fechaFin + ", usuario=" + usuario + ", baneadoPor=" + baneadoPor + ", evidencia="
				+ evidencia + ", revisado=" + revisado + "]";
	}

}
