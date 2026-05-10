package gittogether.tfg.entities;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UsuarioValidationTest {

    private Validator validator;

    @BeforeEach
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    public void testUsuarioValido() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Fjodrigo");
        usuario.setEmail("test@gmail.com");
        usuario.setPassword("123456");

        Set<ConstraintViolation<Usuario>> violations = validator.validate(usuario);
        assertTrue(violations.isEmpty(), "El usuario debería ser válido");
    }

    @Test
    public void testNombreVacio() {
        Usuario usuario = new Usuario();
        usuario.setNombre(""); // Vacío
        usuario.setEmail("test@gmail.com");
        usuario.setPassword("123456");

        Set<ConstraintViolation<Usuario>> violations = validator.validate(usuario);
        assertFalse(violations.isEmpty(), "Debería haber errores de validación para el nombre vacío");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nombre")), "Debería haber un error en el campo 'nombre'");
    }

    @Test
    public void testEmailInvalido() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Fjodrigo");
        usuario.setEmail("test-sin-arroba"); 
        usuario.setPassword("123456");

        Set<ConstraintViolation<Usuario>> violations = validator.validate(usuario);
        assertFalse(violations.isEmpty(), "Debería haber errores de validación para un email sin @");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")), "Debería haber un error en el campo 'email'");
    }

    @Test
    public void testPasswordCorta() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Fjodrigo");
        usuario.setEmail("test@gmail.com");
        usuario.setPassword("12345"); // 5 caracteres (mínimo 6)

        Set<ConstraintViolation<Usuario>> violations = validator.validate(usuario);
        assertFalse(violations.isEmpty(), "Debería haber errores de validación para password corta");
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("mínimo 6 caracteres") || v.getMessage().contains("al menos 6 caracteres")), "Debería informar del mínimo de caracteres");
    }
}
