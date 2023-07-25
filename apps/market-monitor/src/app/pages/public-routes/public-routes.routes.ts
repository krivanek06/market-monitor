import { Routes } from '@angular/router';
import { ROUTES_PUBLIC_ROUTES } from '../../routes.model';
import { PublicRoutesComponent } from './public-routes.component';

export const route: Routes = [
  {
    path: '',
    component: PublicRoutesComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./search/search.routes').then((m) => m.route),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.SEARCH,
        loadChildren: () => import('./search/search.routes').then((m) => m.route),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.STOCK_SCREENER,
        loadChildren: () => import('./stock-screener/stock-screener.routes').then((m) => m.route),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.MARKET,
        loadChildren: () => import('./market/market.routes').then((m) => m.route),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.MARKET_CALENDAR,
        loadChildren: () => import('./calendar/calendar.routes').then((m) => m.route),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.TOP_PERFORMERS,
        loadChildren: () => import('./top-performers/top-performers.routes').then((m) => m.route),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.CRYPTO,
        loadChildren: () => import('./crypto/crypto.routes').then((m) => m.route),
      },
    ],
  },
];
