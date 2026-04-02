import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Foro } from './components/foro/foro';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Si no pone nada, al login
  { path: 'login', component: Login },
  { path: 'foro', component: Foro }
];
