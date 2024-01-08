import { inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
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
            const authenticationState = inject(AuthenticationUserStoreService);
            const router = inject(Router);

            // check if user already loaded
            if (authenticationState.state().authenticationLoaded && authenticationState.state().userData) {
              console.log('USER LOGGED IN', authenticationState.state().userData);
              return true;
            }

            // listen on user loaded
            return authentication.getLoadedAuthentication().pipe(
              tap(() => console.log('CHECK REDIRECT DASHBOARD')),
              take(1),
              map((isLoaded) => (isLoaded ? true : router.navigate([ROUTES_MAIN.LOGIN]))),
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
            path: ROUTES_MAIN.TRADING,
            loadComponent: () => import('./trading/trading.component').then((m) => m.TradingComponent),
          },
          {
            path: ROUTES_MAIN.HALL_OF_FAME,
            loadComponent: () => import('./hall-of-fame/hall-of-fame.component').then((m) => m.HallOfFameComponent),
            canActivate: [
              () => {
                inject(AuthenticationUserStoreService).state.userData()?.features.allowAccessHallOfFame
                  ? true
                  : inject(Router).navigate([ROUTES_MAIN.DASHBOARD]);
              },
            ],
          },
          {
            path: ROUTES_MAIN.GROUPS,
            canActivate: [
              () => {
                inject(AuthenticationUserStoreService).state.userData()?.features.allowAccessGroups
                  ? true
                  : inject(Router).navigate([ROUTES_MAIN.DASHBOARD]);
              },
            ],
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
            loadComponent: () => import('./market/market.component').then((m) => m.MarketComponent),
            children: [
              {
                path: '',
                redirectTo: ROUTES_MAIN.TOP_PERFORMERS,
                pathMatch: 'full',
              },
              {
                path: ROUTES_MAIN.STOCK_SCREENER,
                title: 'Market Top Performers',
                loadComponent: () =>
                  import('./market/market-screener.component').then((m) => m.MarketCalendarComponent),
              },
              {
                path: ROUTES_MAIN.TOP_PERFORMERS,
                title: 'Stock Screener',
                loadComponent: () =>
                  import('./market/market-top-performers.component').then((m) => m.MarketTopPerformersComponent),
              },
              {
                path: ROUTES_MAIN.MARKET_CALENDAR,
                title: 'Market Calendar',
                loadComponent: () =>
                  import('./market/market-calendar.component').then((m) => m.MarketCalendarComponent),
              },
              {
                path: ROUTES_MAIN.ECONOMICS,
                title: 'Market Economics',
                loadComponent: () =>
                  import('./market/market-economics.component').then((m) => m.MarketEconomicsComponent),
              },
              {
                path: ROUTES_MAIN.NEWS,
                title: 'Market News',
                loadComponent: () => import('./market/market-news.component').then((m) => m.MarketNewsComponent),
              },
              {
                path: ROUTES_MAIN.CRYPTO,
                title: 'Crypto',
                loadComponent: () => import('@market-monitor/modules/page-builder').then((m) => m.PageCryptoComponent),
              },
            ],
          },
          {
            path: '**',
            loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
          },
        ],
      },
      {
        path: ROUTES_MAIN.LOGIN,
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
];
