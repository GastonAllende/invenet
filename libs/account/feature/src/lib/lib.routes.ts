import { Route } from '@angular/router';
import { AccountsShellComponent } from './accounts-shell/accounts-shell.component';

export const accountFeatureRoutes: Route[] = [
  {
    path: '',
    component: AccountsShellComponent,
    data: { accountMode: 'list' },
  },
  {
    path: 'new',
    component: AccountsShellComponent,
    data: { accountMode: 'new' },
  },
  {
    path: ':id',
    component: AccountsShellComponent,
    data: { accountMode: 'detail' },
  },
];
