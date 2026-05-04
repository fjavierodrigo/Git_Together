package gittogether.tfg.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Deshabilitamos CSRF para facilitar el desarrollo con APIs
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Permitimos todas las peticiones por ahora
            )
            .httpBasic(basic -> basic.disable()) // Deshabilitamos la autenticación básica por defecto
            .formLogin(form -> form.disable()); // Deshabilitamos el formulario de login por defecto
        
        return http.build();
    }
}
