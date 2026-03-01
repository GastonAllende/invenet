import { Route } from '@angular/router';
import { authGuard } from '@invenet/auth';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AppLayout } from './layout/component/app.layout';

export const appRoutes: Route[] = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
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
