package gittogether.tfg.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_TEMA_TAG")
public class TemaTag {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "identificador")
	private int identificador;

	@ManyToOne
	@JoinColumn(name = "tema_id", foreignKey = @ForeignKey(name = "FK_TEMATAG_TEMA"), nullable = false)
	Tema tema;

	@ManyToOne
	@JoinColumn(name = "tag_id", foreignKey = @ForeignKey(name = "FK_TEMATAG_TAG"), nullable = false)
	Tag tag;

	public int getIdentificador() {
		return identificador;
	}

	public void setIdentificador(int identificador) {
		this.identificador = identificador;
	}

	public Tema getTema() {
		return tema;
	}

	public void setTema(Tema tema) {
		this.tema = tema;
	}

	public Tag getTag() {
		return tag;
	}

	public void setTag(Tag tag) {
		this.tag = tag;
	}

	@Override
	public String toString() {
		return "TemaTag [identificador=" + identificador + ", tema=" + tema + ", tag=" + tag + "]";
	}

}
