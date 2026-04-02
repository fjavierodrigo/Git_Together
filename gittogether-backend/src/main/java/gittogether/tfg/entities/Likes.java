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
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "T_LIKES")
public class Likes {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@Column(name = "fecha", nullable = false)
	private LocalDate fecha;

	@JsonIgnoreProperties({ "password", "avatar", "rol" }) // Solo necesitamos el ID o nombre de quien dio like
	@ManyToOne
	@JoinColumn(name = "usuario_id", foreignKey = @ForeignKey(name = "FK_LIKES_USUARIO"), nullable = false)
	private Usuario usuario;

	@ManyToOne
	@JoinColumn(name = "mensaje_id", foreignKey = @ForeignKey(name = "FK_LIKES_MENSAJE"), nullable = false)
	private Mensaje mensaje;

	public int getIdentificador() {
		return identificador;
	}

	public void setIdentificador(int identificador) {
		this.identificador = identificador;
	}

	public LocalDate getFecha() {
		return fecha;
	}

	public void setFecha(LocalDate fecha) {
		this.fecha = fecha;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public Mensaje getMensaje() {
		return mensaje;
	}

	public void setMensaje(Mensaje mensaje) {
		this.mensaje = mensaje;
	}

	@Override
	public String toString() {
		return "Likes [identificador=" + identificador + ", fecha=" + fecha + ", usuario=" + usuario + ", Mensaje="
				+ mensaje + "]";
	}

}
