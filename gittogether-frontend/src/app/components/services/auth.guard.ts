import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Usuario } from './usuario'; // Ajusta la ruta si es necesario

// Guard que decide si una ruta puede ser activada o no
export const authGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(Usuario);
  const router = inject(Router);

  // Si el usuario tiene un token, permitimos el acceso a la ruta
  if (usuarioService.getToken()) {
    return true;
  }

  // Si no está autenticado, redirigimos a la pantalla de login
  router.navigate(['/login']);
  return false;
};

// Guard para rutas no encontradas (404)
export const wildcardGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(Usuario);
  const router = inject(Router);

  if (usuarioService.getToken()) {
    router.navigate(['/foro']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};