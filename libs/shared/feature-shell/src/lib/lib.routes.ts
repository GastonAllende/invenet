import { Route } from '@angular/router';
import { AppLayout } from './shared-feature-shell/shared-feature-shell';

export const sharedFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: 'journal',
        loadChildren: () =>
          import('@invenet/trade-feature').then((m) => m.tradeFeatureRoutes),
      },
      {
        path: 'strategies',
        loadChildren: () =>
          import('@invenet/strategy-feature').then(
            (m) => m.strategyFeatureRoutes,
          ),
      },
    ],
  },
];
