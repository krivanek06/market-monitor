import { Routes } from '@angular/router';
import { ROUTES_TOP_LEVEL } from './routes.model';

export const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/public-routes/public-routes.component').then((m) => m.route),
      },
      {
        path: `${ROUTES_TOP_LEVEL.STOCK_DETAILS}/:symbol`,
        title: 'Stock Details',
        loadChildren: () => import('./pages/stock-details/stock-details.component').then((m) => m.route),
      },
    ],
  },
];
