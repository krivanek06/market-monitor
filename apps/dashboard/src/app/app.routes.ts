import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router } from '@angular/router';
import { TradingSimulatorApiService } from '@mm/api-client';
import { UserAccountEnum } from '@mm/api-types';
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { featureFlagGuard } from '@mm/authentication/feature-access-directive';
import { IS_DEV_TOKEN, ROUTES_MAIN, ROUTES_TRADING_SIMULATOR } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
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
    loadChildren: () => [
      {
        path: ROUTES_MAIN.LOGIN,
        loadComponent: () => import('@mm/page-builder').then((m) => m.PageLoginComponent),
      },
      {
        path: ROUTES_MAIN.NOT_FOUND,
        loadComponent: () => import('@mm/page-builder').then((m) => m.PageNotFoundComponent),
      },
      {
        path: '',
        loadComponent: () => import('@mm/page-builder').then((m) => m.PageMenuComponent),
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
        loadChildren: () => [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: ROUTES_MAIN.DASHBOARD,
          },
          {
            path: ROUTES_MAIN.DASHBOARD,
            title: 'GGFinance - Dashboard',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageDashboardComponent),
          },
          {
            path: ROUTES_MAIN.WATCHLIST,
            title: 'GGFinance - Watchlist',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageWatchlistComponent),
          },
          {
            path: ROUTES_MAIN.TRADING,
            title: 'GGFinance - Trading',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageTradingComponent),
          },
          {
            path: ROUTES_MAIN.HALL_OF_FAME,
            title: 'GGFinance - Ranking',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageHallOfFameComponent),
            canActivate: [featureFlagGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
          },
          {
            path: ROUTES_MAIN.COMPARE_USERS,
            title: 'GGFinance - Compare Users',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageCompareUsersComponent),
            canActivate: [featureFlagGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
          },
          {
            path: ROUTES_MAIN.GROUPS,
            title: 'GGFinance - Groups',
            canActivate: [featureFlagGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
            loadChildren: () => [
              {
                path: '',
                loadComponent: () => import('./groups/groups.component').then((m) => m.groupsComponent),
              },
              {
                path: ':id',
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageGroupDetailsComponent),
              },
            ],
          },
          {
            path: ROUTES_MAIN.TRADING_SIMULATOR,
            title: 'GGFinance - Trading Simulator',
            loadChildren: () => [
              {
                path: '',
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageTradingSimulatorComponent),
              },
              {
                path: ROUTES_TRADING_SIMULATOR.CREATE,
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageTradingSimulatorCreateComponent),
              },
              {
                path: `${ROUTES_TRADING_SIMULATOR.EDIT}/:id`,
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageTradingSimulatorEditComponent),
                canActivate: [
                  (route: ActivatedRouteSnapshot) => {
                    const authService = inject(AuthenticationUserStoreService);
                    const tradingSimulatorApiService = inject(TradingSimulatorApiService);
                    const router = inject(Router);
                    const dialogServiceUtil = inject(DialogServiceUtil);
                    const user = authService.state().userData;

                    const simulatorId = String(route.paramMap.get('id'));

                    return tradingSimulatorApiService.getTradingSimulatorById(simulatorId).pipe(
                      map((simulator) => {
                        // check if simulator exists
                        if (!simulator) {
                          dialogServiceUtil.showNotificationBar('Trading simulator not found', 'error');
                          router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
                          return false;
                        }

                        // check if simulator is in draft state
                        if (simulator.state !== 'draft') {
                          dialogServiceUtil.showNotificationBar('Trading simulator is not in draft state', 'error');
                          router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
                          return false;
                        }

                        // check if user is the owner
                        if (user && user?.id !== simulator.owner.id) {
                          dialogServiceUtil.showNotificationBar('You are not the owner of this simulator', 'error');
                          router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
                          return false;
                        }

                        return true;
                      }),
                    );
                  },
                ],
              },
              {
                path: `${ROUTES_TRADING_SIMULATOR.DETAILS}/:id`,
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageTradingSimulatorDetailsComponent),
                canActivate: [
                  (route: ActivatedRouteSnapshot) => {
                    const dialogServiceUtil = inject(DialogServiceUtil);
                    const tradingSimulatorApiService = inject(TradingSimulatorApiService);
                    const router = inject(Router);

                    const simulatorId = String(route.paramMap.get('id'));

                    return tradingSimulatorApiService.getTradingSimulatorById(simulatorId).pipe(
                      map((simulator) => {
                        // check if simulator exists
                        if (!simulator) {
                          dialogServiceUtil.showNotificationBar('Trading simulator not found', 'error');
                          router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
                          return false;
                        }

                        return true;
                      }),
                    );
                  },
                ],
              },
              {
                path: `${ROUTES_TRADING_SIMULATOR.STATISTICS}/:id`,
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageTradingSimulatorStatisticsComponent),
                canActivate: [
                  (route: ActivatedRouteSnapshot) => {
                    const dialogServiceUtil = inject(DialogServiceUtil);
                    const tradingSimulatorApiService = inject(TradingSimulatorApiService);
                    const router = inject(Router);

                    const simulatorId = String(route.paramMap.get('id'));

                    return tradingSimulatorApiService.getTradingSimulatorById(simulatorId).pipe(
                      map((simulator) => {
                        // check if simulator exists
                        if (!simulator) {
                          dialogServiceUtil.showNotificationBar('Trading simulator not found', 'error');
                          router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
                          return false;
                        }

                        return true;
                      }),
                    );
                  },
                ],
              },
            ],
          },
          {
            path: `${ROUTES_MAIN.STOCK_DETAILS}/:symbol`,
            title: 'GGFinance - Stock Details',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageStockDetailsComponent),
          },
          {
            path: ROUTES_MAIN.STOCK_SCREENER,
            title: 'GGFinance - Stock Screener',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketStockScreenerComponent),
          },
          {
            path: ROUTES_MAIN.ECONOMICS,
            title: 'GGFinance - Economics',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketOverviewComponent),
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
          {
            path: ROUTES_MAIN.MARKET_CALENDAR,
            title: 'GGFinance -  Calendar',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketCalendarComponent),
          },
          {
            path: ROUTES_MAIN.TOP_PERFORMERS,
            title: 'GGFinance - Top Performers',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketTopPerformersComponent),
          },
          {
            path: ROUTES_MAIN.MARKET,
            title: 'GGFinance - Market',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageMarketComponent),
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
