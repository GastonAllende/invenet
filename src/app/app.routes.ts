import { Routes } from '@angular/router';
import { DashboardLayout } from './layouts';

export const routes: Routes = [
  // Authentication routes (public)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },

  {
    path: '',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },

  // Dashboard routes (protected)
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard-home/dashboard-home.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'user-profile',
        loadChildren: () =>
          import('./features/user-profile/user-profile.routes').then((m) => m.PROFILE_ROUTES),
      },
      {
        path: 'trades',
        loadChildren: () => import('./features/trades/trades.routes').then((m) => m.TRADING_ROUTES),
      },
      {
        path: 'strategy',
        loadChildren: () =>
          import('./features/strategy/strategy.routes').then((m) => m.STRATEGY_ROUTES),
      },
      {
        path: 'ai',
        loadChildren: () => import('./features/ai/ai.routes').then((m) => m.AI_ROUTES),
      },
      {
        path: 'watchlist',
        loadChildren: () =>
          import('./features/watchlist/watchlist.routes').then((m) => m.watchlistRoutes),
      },
    ],
  },

  // Catch-all redirect
  { path: '**', redirectTo: '/login' },
];
