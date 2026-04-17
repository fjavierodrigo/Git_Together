import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Foro } from './components/foro/foro';
import { ForoTema } from './components/foro-tema/foro-tema';
import { authGuard } from './components/services/auth.guard'; // Importamos el guardián de rutas

export const routes: Routes = [
  // Si no pone nada, redirigimos automáticamente a la pantalla de login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta pública para el inicio de sesión
  { path: 'login', component: Login },

  // Ruta protegida: solo los usuarios con token pueden acceder al foro
  {
    path: 'foro',
    component: Foro,
    canActivate: [authGuard] // Aplicamos el guardián aquí
  },
  {
    path: 'foro/tema/:slug',
    component: ForoTema,
    canActivate: [authGuard]
  }
];
