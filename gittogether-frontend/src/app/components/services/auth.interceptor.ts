import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Usuario } from './usuario';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const usuarioService = inject(Usuario);
  const router = inject(Router);
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
      }
      return throwError(() => error);
    })
  );
};