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
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageSearchComponent),
          },
          {
            path: ROUTES_MAIN.STOCK_SCREENER,
            title: 'Stock Screener',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketStockScreenerComponent),
          },
          {
            path: ROUTES_MAIN.MARKET,
            title: 'Market',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketOverviewComponent),
          },
          {
            path: ROUTES_MAIN.MARKET_CALENDAR,
            title: 'Market Calendar',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketCalendarComponent),
          },
          {
            path: ROUTES_MAIN.TOP_PERFORMERS,
            title: 'Top Performers',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketTopPerformersComponent),
          },
        ],
      },
      {
        path: `${ROUTES_MAIN.STOCK_DETAILS}/:symbol`,
        title: 'Stock Details',
        loadComponent: () => import('@mm/page-builder').then((m) => m.PageStockDetailsComponent),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
