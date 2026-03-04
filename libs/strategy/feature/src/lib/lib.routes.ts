import { Route } from '@angular/router';
import { StrategyListPage } from './strategy-list-page/strategy-list.page';
import { StrategyNewPage } from './strategy-new-page/strategy-new.page';
import { StrategyDetailPage } from './strategy-detail-page/strategy-detail.page';
import { StrategyEditPage } from './strategy-edit-page/strategy-edit.page';

export const strategyFeatureRoutes: Route[] = [
  { path: '', component: StrategyListPage },
  { path: 'new', component: StrategyNewPage },
  { path: ':id/edit', component: StrategyEditPage },
  { path: ':id', component: StrategyDetailPage },
];
