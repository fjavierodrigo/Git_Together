package gittogether.tfg.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import gittogether.tfg.entities.Usuario;
import gittogether.tfg.entities.UsuarioBaneado;
import gittogether.tfg.services.UsuarioBaneadoService;
import gittogether.tfg.services.UsuarioService;
import gittogether.tfg.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtBaneoFilter extends OncePerRequestFilter {

    @Autowired
    @Lazy
    private UsuarioService usuarioService;

    @Autowired
    @Lazy
    private UsuarioBaneadoService baneadoService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String method = request.getMethod();
        String path = request.getRequestURI();

        // Solo bloqueamos acciones de escritura (POST, PUT, DELETE)
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
            
            // Excluimos las rutas de autenticación
            boolean esAuth = path.equals("/api/usuarios/login") || path.equals("/api/usuarios/registrar") || path.equals("/api/usuarios/register");
            
            if (!esAuth) {
                String authHeader = request.getHeader("Authorization");
                
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    
                    if (JwtUtil.validateToken(token)) {
                        try {
                            String email = JwtUtil.getEmailFromToken(token);
                            Usuario usuario = usuarioService.obtenerPorEmail(email);
                            
                            UsuarioBaneado baneo = baneadoService.obtenerBaneoActivo(usuario.getIdentificador());
                            if (baneo != null) {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType("text/plain;charset=UTF-8");
                                String msg = "Tu cuenta está restringida. Razón: " + baneo.getRazon();
                                if (baneo.getFechaFin() != null) msg += ". Expira el: " + baneo.getFechaFin();
                                response.getWriter().write(msg);
                                return; // Bloqueamos la petición
                            }
                        } catch (Exception e) {
                            // Ignorar errores de usuario no encontrado o token inválido
                        }
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
