import { Routes } from '@angular/router';

export const TRADING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./trades').then(m => m.Trades),
  },
];
