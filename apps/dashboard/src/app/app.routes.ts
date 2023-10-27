import { inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AuthenticationAccountService } from '@market-monitor/modules/authentication/data-access';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { filter, map, take, tap } from 'rxjs';

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

            return authentication.isAuthenticationLoaded().pipe(
              filter((isLoaded) => isLoaded),
              take(1),
              tap(() => console.log('Redirecting dashboard:', authentication.isUserDataPresent)),
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
            path: `${ROUTES_MAIN.STOCK_DETAILS}/:symbol`,
            title: 'Stock Details',
            loadChildren: () => import('./stock-details/stock-details.component').then((m) => m.route),
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

            return authentication.isAuthenticationLoaded().pipe(
              filter((isLoaded) => isLoaded),
              take(1),
              tap(() => console.log('Redirecting login:', !authentication.isUserDataPresent)),
              map(() => (!authentication.isUserDataPresent ? true : router.navigate([ROUTES_MAIN.DASHBOARD]))),
            );
          },
        ],
      },
    ],
  },
];
