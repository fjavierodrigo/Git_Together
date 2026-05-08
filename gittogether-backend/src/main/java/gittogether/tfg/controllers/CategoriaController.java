package gittogether.tfg.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gittogether.tfg.entities.Categoria;
import gittogether.tfg.entities.Usuario;
import gittogether.tfg.entities.enums.TipoUsuario;
import gittogether.tfg.repositories.CategoriaRepository;
import gittogether.tfg.services.CategoriaService;
import gittogether.tfg.services.UsuarioService;
import gittogether.tfg.util.JwtUtil;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private UsuarioService usuarioService;

    private boolean esAdmin(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("DEBUG: Token no válido o nulo");
            return false;
        }
        try {
            String jwt = token.substring(7);
            String email = JwtUtil.getEmailFromToken(jwt);
            System.out.println("DEBUG: Email extraído del token: " + email);
            Usuario usuario = usuarioService.obtenerPorEmail(email);
            if (usuario == null) {
                System.out.println("DEBUG: Usuario no encontrado en BD");
                return false;
            }
            System.out.println("DEBUG: Rol del usuario en BD: " + usuario.getRol());
            return usuario.getRol() == TipoUsuario.Admin;
        } catch (Exception e) {
            System.out.println("DEBUG: Error al validar Admin: " + e.getMessage());
            return false;
        }
    }

    @PostMapping
    public ResponseEntity<?> crearCategoria(@RequestBody Categoria nuevaCategoria, @RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token no proporcionado");
        }
        try {
            String jwt = token.substring(7);
            String email = JwtUtil.getEmailFromToken(jwt);
            Usuario usuario = usuarioService.obtenerPorEmail(email);
            
            if (usuario == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
            if (usuario.getRol() != TipoUsuario.Admin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Se requiere rol de Administrador");
            }
            
            return ResponseEntity.ok(categoriaService.registrarCategoria(nuevaCategoria));
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("La sesión ha caducado. Por favor, vuelve a entrar.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping
    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable Integer id, @RequestHeader(value = "Authorization", required = false) String token) {
        if (!esAdmin(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acceso denegado: Se requiere rol de Administrador");
        }
        try {
            categoriaService.eliminarCategoria(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error al eliminar la categoría: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarCategoria(@PathVariable Integer id, @RequestBody Map<String, String> payload, @RequestHeader(value = "Authorization", required = false) String token) {
        if (!esAdmin(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acceso denegado: Se requiere rol de Administrador");
        }
        try {
            String nuevoNombre = payload.get("nombre");
            Categoria categoriaActualizada = categoriaService.editarCategoria(id, nuevoNombre);
            return ResponseEntity.ok(categoriaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error al editar la categoría: " + e.getMessage());
        }
    }
}
