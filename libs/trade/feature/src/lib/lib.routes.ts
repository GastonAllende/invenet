import { Route } from '@angular/router';
import { TradeShellComponent } from './trade-feature/trade-shell/trade-shell.component';

export const tradeFeatureRoutes: Route[] = [
  { path: '', component: TradeShellComponent, data: { journalMode: 'list' } },
  { path: 'new', component: TradeShellComponent, data: { journalMode: 'new' } },
  {
    path: ':id/edit',
    component: TradeShellComponent,
    data: { journalMode: 'edit' },
  },
  {
    path: ':id',
    component: TradeShellComponent,
    data: { journalMode: 'detail' },
  },
];
