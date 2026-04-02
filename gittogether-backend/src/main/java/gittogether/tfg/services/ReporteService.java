package gittogether.tfg.services;

import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.entities.Reporte;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.entities.enums.TipoReporte;
import gittogether.tfg.repositories.MensajeRepository;
import gittogether.tfg.repositories.ReporteRepository;
import gittogether.tfg.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MensajeRepository mensajeRepository;

    public Reporte crearReporte(Reporte reporte) {
        reporte.setFecha(LocalDate.now());
        reporte.setEstado(TipoReporte.Pendiente); 

        // 1. Buscamos el usuario real (el que hace la denuncia)
        Usuario denuncianteReal = usuarioRepository.findById(reporte.getUsuario().getIdentificador())
                .orElseThrow(() -> new RuntimeException("El usuario no existe"));

        // 2. Buscamos el mensaje real que está siendo reportado
        Mensaje mensajeReal = mensajeRepository.findById(reporte.getMensaje().getIdentificador())
                .orElseThrow(() -> new RuntimeException("El mensaje reportado no existe"));

        // 3. Asignamos los objetos completos
        reporte.setUsuario(denuncianteReal);
        reporte.setMensaje(mensajeReal);

        return reporteRepository.save(reporte);
    }
    
    public List<Reporte> obtenerTodosLosReportes() {
        return reporteRepository.findAll();
    }
}