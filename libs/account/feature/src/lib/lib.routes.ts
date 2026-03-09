import { Route } from '@angular/router';
import { AccountListPage } from './account-list-page/account-list.page';
import { AccountNewPage } from './account-new-page/account-new.page';
import { AccountDetailPage } from './account-detail-page/account-detail.page';
import { AccountEditPage } from './account-edit-page/account-edit.page';

export const accountFeatureRoutes: Route[] = [
  { path: '', component: AccountListPage },
  { path: 'new', component: AccountNewPage },
  { path: ':id/edit', component: AccountEditPage },
  { path: ':id', component: AccountDetailPage },
];
