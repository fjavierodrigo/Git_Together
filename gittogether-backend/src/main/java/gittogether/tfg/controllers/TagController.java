package gittogether.tfg.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import gittogether.tfg.entities.Tag;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.entities.enums.TipoUsuario;
import gittogether.tfg.repositories.TagRepository;
import gittogether.tfg.services.UsuarioService;
import gittogether.tfg.util.JwtUtil;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = "*")
public class TagController {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @GetMapping("/search")
    public List<Tag> searchTags(@org.springframework.web.bind.annotation.RequestParam String query) {
        return tagRepository.findByNombreContainingIgnoreCase(query);
    }

    @PostMapping
    public ResponseEntity<?> crearTag(@RequestBody Tag nuevoTag, @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                System.out.println("DEBUG TAG: Token nulo");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token no proporcionado");
            }
            String jwt = token.substring(7);
            String email = JwtUtil.getEmailFromToken(jwt);
            System.out.println("DEBUG TAG: Email: " + email);
            Usuario usuario = usuarioService.obtenerPorEmail(email);

            if (usuario == null) {
                System.out.println("DEBUG TAG: Usuario no existe");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Usuario no encontrado");
            }

            System.out.println("DEBUG TAG: Rol: " + usuario.getRol());
            if (usuario.getRol() != TipoUsuario.Admin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acceso denegado: Se requiere rol de Administrador");
            }

            return ResponseEntity.ok(tagRepository.save(nuevoTag));
        } catch (Exception e) {
            System.out.println("DEBUG TAG: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al crear etiqueta: " + e.getMessage());
        }
    }
}
