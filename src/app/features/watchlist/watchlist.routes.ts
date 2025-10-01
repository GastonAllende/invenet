import { Routes } from '@angular/router';

export const watchlistRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./watchlist').then(m => m.Watchlist),
  },
];
