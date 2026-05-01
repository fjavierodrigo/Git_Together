package gittogether.tfg.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import gittogether.tfg.entities.ArchivoAdjunto;
import gittogether.tfg.entities.Mensaje;
import gittogether.tfg.entities.Tema;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.repositories.ArchivoAdjuntoRepository;
import gittogether.tfg.repositories.MensajeRepository;
import gittogether.tfg.repositories.TemaRepository;
import gittogether.tfg.repositories.UsuarioRepository;
import gittogether.tfg.services.S3Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@RestController
@RequestMapping("/api/archivos")
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE })
public class ArchivoAdjuntoController {

    @Autowired
    private S3Service s3Service;

    @Autowired
    private ArchivoAdjuntoRepository archivoAdjuntoRepository;

    @Autowired
    private TemaRepository temaRepository;

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/tema/{temaId}/usuario/{usuarioId}")
    public ResponseEntity<?> subirArchivoTema(
            @PathVariable int temaId,
            @PathVariable int usuarioId,
            @RequestParam("file") MultipartFile file) {

        try {
            Optional<Tema> temaOpt = temaRepository.findById(temaId);
            if (temaOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Tema no encontrado");
            }

            Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Usuario no encontrado");
            }

            Tema tema = temaOpt.get();
            Usuario usuario = usuarioOpt.get();
            
            // Los archivos del tema principal se guardan directamente en la carpeta del slug (comportamiento original)
            String ruta = "temas/" + tema.getSlug();
            
            String s3Key = s3Service.subirArchivoConRuta(file, ruta);

            ArchivoAdjunto archivo = new ArchivoAdjunto();
            archivo.setNombreOriginal(file.getOriginalFilename());
            archivo.setS3Key(s3Key);
            archivo.setTema(tema);

            ArchivoAdjunto guardado = archivoAdjuntoRepository.save(archivo);
            guardado.setUrl(s3Service.generarUrlPresignada(s3Key));

            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al subir archivo: " + e.getMessage());
        }
    }

    @PostMapping("/mensaje/{mensajeId}/usuario/{usuarioId}")
    public ResponseEntity<?> subirArchivoMensaje(
            @PathVariable int mensajeId,
            @PathVariable int usuarioId,
            @RequestParam("file") MultipartFile file) {

        try {
            Optional<Mensaje> mensajeOpt = mensajeRepository.findById(mensajeId);
            if (mensajeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Mensaje no encontrado");
            }

            Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Usuario no encontrado");
            }

            Mensaje mensaje = mensajeOpt.get();
            Usuario usuario = usuarioOpt.get();
            
            // Para los mensajes, sí creamos una subcarpeta con el nombre del usuario dentro de la carpeta del tema
            String nombreUsuarioLimpio = usuario.getNombre().trim().replace(" ", "_").replaceAll("[^a-zA-Z0-9_-]", "");
            String ruta = "temas/" + mensaje.getTema().getSlug() + "/" + nombreUsuarioLimpio;
            
            String s3Key = s3Service.subirArchivoConRuta(file, ruta);

            ArchivoAdjunto archivo = new ArchivoAdjunto();
            archivo.setNombreOriginal(file.getOriginalFilename());
            archivo.setS3Key(s3Key);
            archivo.setMensaje(mensaje);

            ArchivoAdjunto guardado = archivoAdjuntoRepository.save(archivo);
            guardado.setUrl(s3Service.generarUrlPresignada(s3Key));

            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al subir archivo: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUrlArchivo(@PathVariable int id) {
        Optional<ArchivoAdjunto> archivoOpt = archivoAdjuntoRepository.findById(id);
        if (archivoOpt.isPresent()) {
            ArchivoAdjunto archivo = archivoOpt.get();
            return ResponseEntity.ok(s3Service.generarUrlPresignada(archivo.getS3Key()));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarArchivo(@PathVariable int id) {
        Optional<ArchivoAdjunto> archivoOpt = archivoAdjuntoRepository.findById(id);
        if (archivoOpt.isPresent()) {
            ArchivoAdjunto archivo = archivoOpt.get();
            s3Service.eliminarArchivo(archivo.getS3Key());
            archivoAdjuntoRepository.delete(archivo);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/{id}/descargar")
    public ResponseEntity<byte[]> descargarArchivo(@PathVariable int id) {
        Optional<ArchivoAdjunto> archivoOpt = archivoAdjuntoRepository.findById(id);
        if (archivoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ArchivoAdjunto archivo = archivoOpt.get();
        try {
            ResponseInputStream<GetObjectResponse> s3Object = s3Service.descargarArchivo(archivo.getS3Key());
            byte[] bytes = s3Object.readAllBytes();
            String contentType = s3Object.response().contentType();
            if (contentType == null || contentType.isBlank())
                contentType = "application/octet-stream";

            String encodedName = URLEncoder.encode(archivo.getNombreOriginal(), StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                    .contentType(MediaType.parseMediaType(contentType))
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
