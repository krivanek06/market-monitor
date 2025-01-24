import { inject, Injectable } from '@angular/core';
import { PreloadingStrategy, Route, Router } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { UserAccountEnum } from '@mm/api-types';
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { featureFlagGuard, userAccountTypeGuard } from '@mm/authentication/feature-access-directive';
import { IS_DEV_TOKEN, ROUTES_MAIN, ROUTES_TRADING_SIMULATOR } from '@mm/shared/data-access';
import { tradingSimulatorDetailsGuard, tradingSimulatorEditGuard } from '@mm/trading-simulator/data-access';
import { map, Observable, of, take, tap } from 'rxjs';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./marketing/marketing-initial.component').then((m) => m.MarketingInitialComponent),
  },
  {
    path: ROUTES_MAIN.LOGIN,
    loadComponent: () => import('@mm/page-builder').then((m) => m.PageLoginComponent),
  },
  {
    path: ROUTES_MAIN.NOT_FOUND,
    loadComponent: () => import('@mm/page-builder').then((m) => m.PageNotFoundComponent),
  },
  {
    path: ROUTES_MAIN.APP,
    // canMatch: [
    //   () => {
    //     const authState = inject(AuthenticationUserStoreService).state();
    //     const isDev = inject(IS_DEV_TOKEN);

    //     // show only when not loading auth state or in dev (faster page reload)
    //     return authState.authenticationState !== 'LOADING' || isDev;
    //   },
    // ],
    loadChildren: () => [
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
            canActivate: [userAccountTypeGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
          },
          {
            path: ROUTES_MAIN.COMPARE_USERS,
            title: 'GGFinance - Compare Users',
            loadComponent: () => import('@mm/page-builder').then((m) => m.PageCompareUsersComponent),
            canActivate: [userAccountTypeGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
          },
          {
            path: ROUTES_MAIN.GROUPS,
            title: 'GGFinance - Groups',
            canActivate: [userAccountTypeGuard(UserAccountEnum.DEMO_TRADING, ROUTES_MAIN.DASHBOARD)],
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
                canActivate: [featureFlagGuard('createTradingSimulator')],
              },
              {
                path: `${ROUTES_TRADING_SIMULATOR.EDIT}/:id`,
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageTradingSimulatorEditComponent),
                canActivate: [tradingSimulatorEditGuard],
              },
              {
                path: `${ROUTES_TRADING_SIMULATOR.DETAILS}/:id`,
                loadComponent: () => import('@mm/page-builder').then((m) => m.PageTradingSimulatorDetailsComponent),
                canActivate: [tradingSimulatorDetailsGuard],
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
        path: ROUTES_MAIN.NOT_FOUND,
        loadComponent: () => import('@mm/page-builder').then((m) => m.PageNotFoundComponent),
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

export const serverRoutes: ServerRoute[] = [
  // prerender
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: ROUTES_MAIN.NOT_FOUND,
    renderMode: RenderMode.Prerender,
  },
  {
    path: ROUTES_MAIN.LOGIN,
    renderMode: RenderMode.Prerender,
  },

  // client rendering
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.DASHBOARD}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.WATCHLIST}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.TRADING}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.HALL_OF_FAME}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.COMPARE_USERS}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.GROUPS}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.TRADING_SIMULATOR}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.STOCK_DETAILS}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.STOCK_SCREENER}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.ECONOMICS}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.NEWS}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.CRYPTO}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.MARKET_CALENDAR}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.TOP_PERFORMERS}`,
    renderMode: RenderMode.Client,
  },
  {
    path: `${ROUTES_MAIN.APP}/${ROUTES_MAIN.MARKET}`,
    renderMode: RenderMode.Client,
  },
];

@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy extends PreloadingStrategy {
  private routesToPreload: Route[] = [];

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if the route is marked for on-demand preloading
    if (route.data?.['preloadOnNavigate'] && this.routesToPreload.includes(route)) {
      console.log('preload', route.data?.['preloadOnNavigate']);
      return load(); // Preload the route
    }
    return of(null); // Skip preloading
  }

  // Called when navigation to the specified route occurs
  markForPreload(route: Route): void {
    this.routesToPreload.push(route);
  }
}
