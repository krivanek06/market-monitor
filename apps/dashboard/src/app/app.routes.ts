import { inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AuthenticationAccountService } from '@market-monitor/modules/authentication/data-access';
import { groupDetailsResolver } from '@market-monitor/modules/page-builder';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { map, take, tap } from 'rxjs';

export const appRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./menu/menu.component').then((m) => m.MenuComponent),
        canActivate: [
          () => {
            const authentication = inject(AuthenticationAccountService);
            const router = inject(Router);

            return authentication.getUserData().pipe(
              tap(() => console.log('CHECK REDIRECT DASHBOARD')),
              take(1),
              map(() => (authentication.isUserDataPresent ? true : router.navigate([ROUTES_MAIN.LOGIN]))),
            );
          },
        ],
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: ROUTES_MAIN.DASHBOARD,
          },
          {
            path: ROUTES_MAIN.DASHBOARD,
            loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
          },
          {
            path: ROUTES_MAIN.WATCHLIST,
            loadComponent: () => import('./watchlist/watchlist.component').then((m) => m.WatchlistComponent),
          },
          {
            path: ROUTES_MAIN.SETTING,
            loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
          },
          {
            path: ROUTES_MAIN.TRADING,
            loadComponent: () => import('./trading/trading.component').then((m) => m.TradingComponent),
          },
          {
            path: ROUTES_MAIN.GROUPS,
            children: [
              {
                path: '',
                loadComponent: () => import('./groups/groups.component').then((m) => m.GroupsComponent),
              },
              {
                path: ':id',
                title: 'Group Details',
                loadComponent: () =>
                  import('./groups/group-details/group-details.component').then((m) => m.GroupDetailsComponent),
                resolve: {
                  groupDetails: groupDetailsResolver,
                },
              },
            ],
          },
          {
            path: `${ROUTES_MAIN.STOCK_DETAILS}/:symbol`,
            title: 'Stock Details',
            loadChildren: () => import('./stock-details/stock-details.component').then((m) => m.route),
          },
          {
            path: ROUTES_MAIN.STOCK_SCREENER,
            title: 'Stock Screener',
            loadComponent: () =>
              import('./stock-screener/stock-screener.component').then((m) => m.StockScreenerComponent),
          },
          {
            path: ROUTES_MAIN.MARKET,
            title: 'Market',
            loadChildren: () => import('./market/market.component').then((m) => m.route),
          },
          {
            path: ROUTES_MAIN.MARKET_CALENDAR,
            title: 'Market Calendar',
            loadComponent: () =>
              import('@market-monitor/modules/page-builder').then((m) => m.PageMarketCalendarComponent),
          },
          {
            path: ROUTES_MAIN.TOP_PERFORMERS,
            title: 'Top Performers',
            loadComponent: () =>
              import('@market-monitor/modules/page-builder').then((m) => m.PageMarketTopPerformersComponent),
          },
          {
            path: ROUTES_MAIN.CRYPTO,
            title: 'Crypto',
            loadComponent: () => import('@market-monitor/modules/page-builder').then((m) => m.PageCryptoComponent),
          },
        ],
      },
      {
        path: ROUTES_MAIN.LOGIN,
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
        canActivate: [
          () => {
            const authentication = inject(AuthenticationAccountService);
            const router = inject(Router);

            // return authentication.getUserData().pipe(
            //   tap(() => console.log('CHECK REDIRECT LOGIN')),
            //   take(1),
            //   map(() => (!authentication.isUserDataPresent ? true : router.navigate([ROUTES_MAIN.DASHBOARD]))),
            // );
            return true;
          },
        ],
      },
    ],
  },
];
