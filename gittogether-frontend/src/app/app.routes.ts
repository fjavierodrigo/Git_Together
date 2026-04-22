import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Foro } from './components/foro/foro';
import { ForoTema } from './components/foro-tema/foro-tema';
import { Perfil } from './components/perfil/perfil';
import { authGuard, wildcardGuard } from './components/services/auth.guard'; // Importamos los guardianes de rutas

export const routes: Routes = [
  // Si no pone nada, redirigimos automáticamente a la pantalla de login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta pública para el inicio de sesión
  { path: 'login', component: Login },

  // Ruta pública para el registro
  { path: 'register', component: Register },

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
  },
  {
    path: 'perfil',
    component: Perfil,
    canActivate: [authGuard]
  },
  // Ruta comodín: captura cualquier URL no definida
  {
    path: '**',
    canActivate: [wildcardGuard],
    component: Login
  }
];
