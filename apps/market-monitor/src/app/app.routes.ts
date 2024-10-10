import { Routes } from '@angular/router';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { PublicRoutesComponent } from './pages/public-routes/public-routes.component';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => [
      {
        path: '',
        component: PublicRoutesComponent,
        loadChildren: () => [
          {
            path: '',
            title: 'Search',
            loadComponent: () =>
              import('./pages/public-routes/subpages/search.component').then((m) => m.SearchComponent),
          },
          {
            path: ROUTES_MAIN.STOCK_SCREENER,
            title: 'Stock Screener',
            loadComponent: () =>
              import('./pages/public-routes/subpages/stock-screener.component').then((m) => m.StockScreenerComponent),
          },
          {
            path: ROUTES_MAIN.MARKET,
            title: 'Market',
            loadComponent: () =>
              import('./pages/public-routes/subpages/market.component').then((m) => m.MarketComponent),
          },
          {
            path: ROUTES_MAIN.MARKET_CALENDAR,
            title: 'Market Calendar',
            loadComponent: () =>
              import('./pages/public-routes/subpages/calendar.component').then((m) => m.CalendarComponent),
          },
          {
            path: ROUTES_MAIN.TOP_PERFORMERS,
            title: 'Top Performers',
            loadComponent: () =>
              import('./pages/public-routes/subpages/top-performers.component').then((m) => m.TopPerformersComponent),
          },
          {
            path: ROUTES_MAIN.CRYPTO,
            title: 'Crypto',
            loadComponent: () =>
              import('./pages/public-routes/subpages/crypto.component').then((m) => m.CryptoComponent),
          },
        ],
      },
      {
        path: `${ROUTES_MAIN.STOCK_DETAILS}/:symbol`,
        title: 'Stock Details',
        loadComponent: () =>
          import('./pages/stock-details/stock-details.component').then((m) => m.StockDetailsComponent),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
