import { Routes, CanActivateFn, Router } from '@angular/router';
import { DashboardLayout } from './layouts';
import { inject } from '@angular/core';
import { Auth } from './core/store/auth.store';

const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const hasToken = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
  const isAuthed = auth.isAuthenticated();
  return isAuthed || hasToken ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  // Authentication routes (public)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    title: 'Login · Invenet',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
    title: 'Register · Invenet',
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  // Dashboard routes (protected)
  {
    path: 'dashboard',
    component: DashboardLayout,
    //canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard-home/dashboard-home.routes').then(m => m.DASHBOARD_ROUTES),
        title: 'Dashboard · Invenet',
      },
      {
        path: 'user-profile',
        loadChildren: () => import('./features/user-profile/user-profile.routes').then(m => m.PROFILE_ROUTES),
        title: 'Profile · Invenet',
      },
      {
        path: 'trades',
        loadChildren: () => import('./features/trades/trades.routes').then(m => m.TRADING_ROUTES),
        title: 'Trades · Invenet',
      },
      {
        path: 'strategy',
        loadChildren: () => import('./features/strategy/strategy.routes').then(m => m.STRATEGY_ROUTES),
        title: 'Strategy · Invenet',
      },
      {
        path: 'ai',
        loadChildren: () => import('./features/ai/ai.routes').then(m => m.AI_ROUTES),
        title: 'AI · Invenet',
      },
      {
        path: 'watchlist',
        loadChildren: () => import('./features/watchlist/watchlist.routes').then(m => m.watchlistRoutes),
        title: 'Watchlist · Invenet',
      },
    ],
  },

  // Catch-all redirect
  {
    path: '**',
    loadComponent: () => import('./shared/utils/not-found/not-found').then(m => m.NotFound),
    title: 'Not Found · Invenet',
  },
];
