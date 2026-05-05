import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Usuario } from './usuario';
import { ToastService } from '../../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const usuarioService = inject(Usuario);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const token = usuarioService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        usuarioService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Manejo global de baneos
        const mensaje = typeof error.error === 'string' ? error.error : "Tu cuenta tiene restricciones de acceso.";
        toastService.error(mensaje);
      }
      return throwError(() => error);
    })
  );
};