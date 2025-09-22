import { Routes } from '@angular/router';

export const STRATEGY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./strategy').then((m) => m.Strategy),
  },
];
