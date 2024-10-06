import { inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { UserAccountEnum } from '@mm/api-types';
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { featureFlagGuard } from '@mm/authentication/feature-access-directive';
import { IS_DEV_TOKEN, ROUTES_MAIN } from '@mm/shared/data-access';
import { map, take, tap } from 'rxjs';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./app-loading/app-loading.component').then((m) => m.AppLoadingComponent),
    canMatch: [
      () => {
        const authState = inject(AuthenticationUserStoreService).state();
        const isDev = inject(IS_DEV_TOKEN);

        // show only when loading auth state and in production
        return authState.authenticationState === 'LOADING' && !isDev;
      },
    ],
  },
  {
    path: '',
    canMatch: [
      () => {
        const authState = inject(AuthenticationUserStoreService).state();
        const isDev = inject(IS_DEV_TOKEN);

        // show only when not loading auth state or in dev (faster page reload)
        return authState.authenticationState !== 'LOADING' || isDev;
      },
    ],
    children: [
      {
        path: ROUTES_MAIN.LOGIN,
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: ROUTES_MAIN.NOT_FOUND,
        loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: '',
        loadComponent: () => import('./menu/menu.component').then((m) => m.MenuComponent),
        canMatch: [
          () => {
            const authentication = inject(AuthenticationAccountService);
            const authenticationState = inject(AuthenticationUserStoreService);
            const router = inject(Router);

            // check if user already loaded
            if (authenticationState.state().authenticationState === 'SUCCESS' && authenticationState.state().userData) {
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
            title: 'GGFinance - Dashboard',
            loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
          },
          {
            path: ROUTES_MAIN.WATCHLIST,
            title: 'GGFinance - Watchlist',
            loadComponent: () => import('./watchlist/watchlist.component').then((m) => m.WatchlistComponent),
          },
          {
            path: ROUTES_MAIN.TRADING,
            title: 'GGFinance - Trading',
            loadComponent: () => import('./trading/trading.component').then((m) => m.TradingComponent),
          },
          {
            path: ROUTES_MAIN.HALL_OF_FAME,
            title: 'GGFinance - Ranking',
            loadComponent: () => import('./hall-of-fame/hall-of-fame.component').then((m) => m.HallOfFameComponent),
            canActivate: [featureFlagGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
          },
          {
            path: ROUTES_MAIN.COMPARE_USERS,
            title: 'GGFinance - Compare Users',
            loadComponent: () => import('./compare-users/compare-users.component').then((m) => m.CompareUsersComponent),
            canActivate: [featureFlagGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
          },
          {
            path: ROUTES_MAIN.GROUPS,
            title: 'GGFinance - Groups',
            canActivate: [featureFlagGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
            children: [
              {
                path: '',
                loadComponent: () => import('./groups/groups.component').then((m) => m.GroupsComponent),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./groups/group-details/group-details.component').then((m) => m.GroupDetailsComponent),
              },
            ],
          },
          {
            path: `${ROUTES_MAIN.STOCK_DETAILS}/:symbol`,
            title: 'GGFinance - Stock Details',
            loadComponent: () => import('./stock-details/stock-details.component').then((m) => m.StockDetailsComponent),
          },
          {
            path: ROUTES_MAIN.STOCK_SCREENER,
            title: 'GGFinance - Stock Screener',
            loadComponent: () => import('./market/market-screener.component').then((m) => m.MarketCalendarComponent),
          },
          {
            path: ROUTES_MAIN.MARKET,
            title: 'GGFinance - Market',
            loadComponent: () => import('./market/market.component').then((m) => m.MarketComponent),
            children: [
              {
                path: '',
                redirectTo: ROUTES_MAIN.TOP_PERFORMERS,
                pathMatch: 'full',
              },
              {
                path: ROUTES_MAIN.STOCK_SCREENER,
                title: 'GGFinance - Stock Screener',
                loadComponent: () =>
                  import('./market/market-screener.component').then((m) => m.MarketCalendarComponent),
              },
              {
                path: ROUTES_MAIN.TOP_PERFORMERS,
                title: 'GGFinance - Top Performers',
                loadComponent: () =>
                  import('./market/market-top-performers.component').then((m) => m.MarketTopPerformersComponent),
              },
              {
                path: ROUTES_MAIN.MARKET_CALENDAR,
                title: 'GGFinance -  Calendar',
                loadComponent: () =>
                  import('./market/market-calendar.component').then((m) => m.MarketCalendarComponent),
              },
              {
                path: ROUTES_MAIN.ECONOMICS,
                title: 'GGFinance - Economics',
                loadComponent: () =>
                  import('./market/market-economics.component').then((m) => m.MarketEconomicsComponent),
              },
              {
                path: ROUTES_MAIN.NEWS,
                title: 'GGFinance - News',
                loadComponent: () => import('./market/market-news.component').then((m) => m.MarketNewsComponent),
              },
              {
                path: ROUTES_MAIN.CRYPTO,
                title: 'GGFinance - Crypto',
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageCryptoComponent),
              },
            ],
          },
        ],
      },
      {
        path: '**',
        redirectTo: ROUTES_MAIN.NOT_FOUND,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
