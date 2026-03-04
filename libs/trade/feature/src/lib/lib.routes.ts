import { Route } from '@angular/router';
import { TradeListPage } from './trade-list-page/trade-list.page';
import { TradeNewPage } from './trade-new-page/trade-new.page';
import { TradeEditPage } from './trade-edit-page/trade-edit.page';
import { TradeDetailPage } from './trade-detail-page/trade-detail.page';

export const tradeFeatureRoutes: Route[] = [
  { path: '', component: TradeListPage },
  { path: 'new', component: TradeNewPage },
  { path: ':id/edit', component: TradeEditPage },
  { path: ':id', component: TradeDetailPage },
];
