package gittogether.tfg.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;

public class JwtUtil {
	private static final String SECRET_KEY = "mi_clave_secreta_super_segura";

	public static String generateToken(String email) {
		// Genera un token que dura una hora
		return Jwts.builder().setSubject(email).setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + 3600000))
				.signWith(SignatureAlgorithm.HS256, SECRET_KEY).compact();
	}
}
