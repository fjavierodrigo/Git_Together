package gittogether.tfg.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    @Lazy
    private JwtBaneoFilter baneoFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Deshabilitamos CSRF para facilitar el desarrollo con APIs
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Permitimos todas las peticiones por ahora (la seguridad se gestiona en los controladores o filtros específicos)
            )
            .httpBasic(basic -> basic.disable()) // Deshabilitamos la autenticación básica por defecto
            .formLogin(form -> form.disable()) // Deshabilitamos el formulario de login por defecto
            .addFilterBefore(baneoFilter, UsernamePasswordAuthenticationFilter.class); // Añadimos el filtro de baneo
        
        return http.build();
    }
}
