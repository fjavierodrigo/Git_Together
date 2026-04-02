package gittogether.tfg.entities;

import java.time.LocalDate;
import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import gittogether.tfg.entities.enums.TipoUsuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Genera Getters, Setters, etc.
@NoArgsConstructor // OBLIGATORIO para JPA (Constructor vacío)
@AllArgsConstructor // Útil para crear usuarios rápidamente
@Entity
@Table(name = "T_USUARIO")
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@Column(name = "nombre", length = 255, nullable = false, unique = true)
	private String nombre;

	@Column(name = "email", length = 255, nullable = false, unique = true)
	private String email;

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Column(name = "password", length = 255, nullable = false)
	private String password;

	// El avatar es pesado, mejor pedirlo solo cuando sea necesario
	@JsonIgnore
	@Lob
	@Column(name = "avatar", columnDefinition = "LONGBLOB")
	private byte[] avatar;

	@Enumerated(EnumType.STRING)
	@Column(name = "rol", nullable = false)
	private TipoUsuario rol;

	// Para que React lo lea fácil
	@JsonFormat(pattern = "yyyy-MM-dd")
	@Column(name = "fecha_registro", nullable = false)
	private LocalDate fechaRegistro;

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

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public byte[] getAvatar() {
		return avatar;
	}

	public void setAvatar(byte[] avatar) {
		this.avatar = avatar;
	}

	public TipoUsuario getRol() {
		return rol;
	}

	public void setRol(TipoUsuario rol) {
		this.rol = rol;
	}

	public LocalDate getFechaRegistro() {
		return fechaRegistro;
	}

	public void setFechaRegistro(LocalDate fechaRegistro) {
		this.fechaRegistro = fechaRegistro;
	}

	@Override
	public String toString() {
		return "Usuario [identificador=" + identificador + ", nombre=" + nombre + ", email=" + email + ", password="
				+ password + ", avatar=" + Arrays.toString(avatar) + ", rol=" + rol + ", fechaRegistro=" + fechaRegistro
				+ "]";
	}

}
