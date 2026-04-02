package gittogether.tfg.controllers;

import gittogether.tfg.entities.Reporte;
import gittogether.tfg.services.ReporteService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {
	
    @Autowired
    private ReporteService reporteService;

    // Endpoint: http://localhost:8080/api/reportes/crear
    @PostMapping("/registrar")
    public ResponseEntity<?> crearReporte(@RequestBody Reporte reporte) {
        try {
            Reporte nuevoReporte = reporteService.crearReporte(reporte);
            return ResponseEntity.ok(nuevoReporte);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error al crear reporte: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Reporte>> listarReportes() {
        return ResponseEntity.ok(reporteService.obtenerTodosLosReportes());
    }
}