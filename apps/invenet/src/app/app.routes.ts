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
        path: 'strategy',
        loadComponent: () =>
          import('@invenet/strategies').then((m) => m.Strategies),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('@invenet/accounts').then((m) => m.Accounts),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
