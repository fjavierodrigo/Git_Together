import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Usuario } from './usuario'; // Ajusta la ruta si es necesario

// Función que intercepta todas las peticiones HTTP salientes
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const usuarioService = inject(Usuario);
  const token = usuarioService.getToken();

  // Si tenemos un token, clonamos la petición original y le añadimos la cabecera Authorization
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        // Formato estándar Bearer para tokens JWT
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // Si no hay token, la petición sigue su curso original (útil para el login mismo)
  return next(req);
};