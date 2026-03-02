import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Nora from '@primeuix/themes/nora';
import { appRoutes } from './app.routes';
import { API_BASE_URL } from '@invenet/core';
import { authInterceptor } from '@invenet/shared-util-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(appRoutes),
    providePrimeNG({
      theme: { preset: Nora, options: { darkModeSelector: '.app-dark' } },
    }),
    { provide: API_BASE_URL, useValue: 'http://localhost:5256' },
  ],
};
