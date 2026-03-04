import { Route } from '@angular/router';
import { StrategyShellComponent } from './strategy-shell/strategy-shell.component';

export const strategyFeatureRoutes: Route[] = [
  {
    path: '',
    component: StrategyShellComponent,
    data: { strategyMode: 'list' },
  },
  {
    path: 'new',
    component: StrategyShellComponent,
    data: { strategyMode: 'new' },
  },
  {
    path: ':id',
    component: StrategyShellComponent,
    data: { strategyMode: 'detail' },
  },
  {
    path: ':id/edit',
    component: StrategyShellComponent,
    data: { strategyMode: 'edit' },
  },
];
