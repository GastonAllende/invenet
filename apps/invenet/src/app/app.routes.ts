import { Route } from '@angular/router';
import { authGuard } from '@invenet/shared-util-auth';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('@invenet/auth-feature').then((m) => m.AUTH_ROUTES),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@invenet/shared-feature-shell').then(
        (m) => m.sharedFeatureShellRoutes,
      ),
  },
  { path: '**', redirectTo: '' },
];
