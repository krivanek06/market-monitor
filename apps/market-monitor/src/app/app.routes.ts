import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ROUTES_TOP_LEVEL } from './routes.model';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '',
        redirectTo: ROUTES_TOP_LEVEL.SEARCH,
        pathMatch: 'full',
      },
      {
        path: ROUTES_TOP_LEVEL.SEARCH,
        loadChildren: () => import('./pages/search/search.routes').then((m) => m.route),
      },
      {
        path: `${ROUTES_TOP_LEVEL.STOCK_DETAILS}:symbol`,
        loadChildren: () => import('./pages/stock-details/stock-details.routes').then((m) => m.route),
      },
      {
        path: ROUTES_TOP_LEVEL.STOCK_SCREENER,
        loadChildren: () => import('./pages/stock-screener/stock-screener.routes').then((m) => m.route),
      },
      {
        path: ROUTES_TOP_LEVEL.MARKET,
        loadChildren: () => import('./pages/market/market.routes').then((m) => m.route),
      },
      {
        path: ROUTES_TOP_LEVEL.TOP_PERFORMERS,
        loadChildren: () => import('./pages/top-performers/top-performers.routes').then((m) => m.route),
      },
      {
        path: ROUTES_TOP_LEVEL.CRYPTO,
        loadChildren: () => import('./pages/crypto/crypto.routes').then((m) => m.route),
      },
      {
        path: ROUTES_TOP_LEVEL.DASHBOARD,
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then((m) => m.route),
      }
    ],
  },
];
