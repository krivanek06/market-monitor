import { Routes } from '@angular/router';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';

export const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/public-routes/public-routes.component').then((m) => m.route),
      },
      {
        path: `${ROUTES_MAIN.STOCK_DETAILS}/:symbol`,
        title: 'Stock Details',
        loadChildren: () => import('./pages/stock-details/stock-details.component').then((m) => m.route),
      },
    ],
  },
];
