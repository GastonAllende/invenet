import { Route } from '@angular/router';
import { authGuard } from '@invenet/shared-util-auth';
import { AppLayout } from './layout/component/app.layout';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('@invenet/auth-feature').then((m) => m.AUTH_ROUTES),
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  { path: 'verify-email', redirectTo: 'auth/verify-email', pathMatch: 'full' },
  {
    path: 'forgot-password',
    redirectTo: 'auth/forgot-password',
    pathMatch: 'full',
  },
  {
    path: 'reset-password',
    redirectTo: 'auth/reset-password',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@invenet/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'journal/new',
        loadComponent: () => import('@invenet/trades').then((m) => m.Trades),
        data: { journalMode: 'new' },
      },
      {
        path: 'journal/:id/edit',
        loadComponent: () => import('@invenet/trades').then((m) => m.Trades),
        data: { journalMode: 'edit' },
      },
      {
        path: 'journal/:id',
        loadComponent: () => import('@invenet/trades').then((m) => m.Trades),
        data: { journalMode: 'detail' },
      },
      {
        path: 'journal',
        pathMatch: 'full',
        loadComponent: () => import('@invenet/trades').then((m) => m.Trades),
        data: { journalMode: 'list' },
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('@invenet/analytics').then((m) => m.Analytics),
      },
      {
        path: 'strategies/new',
        loadComponent: () =>
          import('@invenet/strategies').then((m) => m.Strategies),
        data: { strategyMode: 'new' },
      },
      {
        path: 'strategies/:id/edit',
        loadComponent: () =>
          import('@invenet/strategies').then((m) => m.Strategies),
        data: { strategyMode: 'edit' },
      },
      {
        path: 'strategies/:id',
        loadComponent: () =>
          import('@invenet/strategies').then((m) => m.Strategies),
        data: { strategyMode: 'detail' },
      },
      {
        path: 'strategies',
        pathMatch: 'full',
        loadComponent: () =>
          import('@invenet/strategies').then((m) => m.Strategies),
        data: { strategyMode: 'list' },
      },
      {
        path: 'accounts/new',
        loadComponent: () =>
          import('@invenet/accounts').then((m) => m.Accounts),
        data: { accountMode: 'new' },
      },
      {
        path: 'accounts/:id',
        loadComponent: () =>
          import('@invenet/accounts').then((m) => m.Accounts),
        data: { accountMode: 'detail' },
      },
      {
        path: 'accounts',
        pathMatch: 'full',
        loadComponent: () =>
          import('@invenet/accounts').then((m) => m.Accounts),
        data: { accountMode: 'list' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
