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
        path: 'trades',
        loadComponent: () => import('@invenet/trades').then((m) => m.Trades),
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
      { path: 'strategy', redirectTo: 'strategies', pathMatch: 'full' },
      { path: 'strategy/new', redirectTo: 'strategies/new', pathMatch: 'full' },
      { path: 'strategy/:id', redirectTo: 'strategies/:id' },
      { path: 'strategy/:id/edit', redirectTo: 'strategies/:id/edit' },
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
      { path: 'account/new', redirectTo: 'accounts/new', pathMatch: 'full' },
      { path: 'account/:id', redirectTo: 'accounts/:id' },
      { path: 'account', redirectTo: 'accounts', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
