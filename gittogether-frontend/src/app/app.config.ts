import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './components/services/auth.interceptor'; // Importa tu interceptor
import { provideMarkdown } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Configuramos el cliente HTTP con nuestro interceptor de JWT
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideMarkdown()
  ]
};