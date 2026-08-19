import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Nora from '@primeuix/themes/nora';
import { appRoutes } from './app.routes';
import { API_BASE_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from '@invenet/core';
import { authInterceptor } from '@invenet/shared-util-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
    provideRouter(appRoutes),
    providePrimeNG({
      theme: { preset: Nora, options: { darkModeSelector: '.app-dark' } },
    }),
    { provide: API_BASE_URL, useValue: 'http://localhost:5256' },
    {
      provide: SUPABASE_URL,
      useValue: 'https://afbbrzpkstrgnyagaavb.supabase.co',
    },
    {
      provide: SUPABASE_ANON_KEY,
      useValue: 'sb_publishable_T8IDv-ZAQNzun_6qhJkk3A_gZ4BHX0G',
    },
  ],
};
