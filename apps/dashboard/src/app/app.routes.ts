import { inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AuthenticationAccountService } from '@market-monitor/modules/authentication/data-access';
import { DASHBOARD_MAIN_ROUTES } from '@market-monitor/shared/data-access';
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
              map(() => (authentication.isUserDataPresent ? true : router.navigate([DASHBOARD_MAIN_ROUTES.LOGIN]))),
            );
          },
        ],
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: DASHBOARD_MAIN_ROUTES.DASHBOARD,
          },
          {
            path: DASHBOARD_MAIN_ROUTES.DASHBOARD,
            loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
          },
          {
            path: DASHBOARD_MAIN_ROUTES.WATCHLIST,
            loadComponent: () => import('./watchlist/watchlist.component').then((m) => m.WatchlistComponent),
          },
          {
            path: DASHBOARD_MAIN_ROUTES.SETTING,
            loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
          },
          {
            path: DASHBOARD_MAIN_ROUTES.TRADING,
            loadComponent: () => import('./trading/trading.component').then((m) => m.TradingComponent),
          },
        ],
      },
      {
        path: DASHBOARD_MAIN_ROUTES.LOGIN,
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
        canActivate: [
          () => {
            const authentication = inject(AuthenticationAccountService);
            const router = inject(Router);

            return authentication.isAuthenticationLoaded().pipe(
              filter((isLoaded) => isLoaded),
              take(1),
              tap(() => console.log('Redirecting login:', !authentication.isUserDataPresent)),
              map(() =>
                !authentication.isUserDataPresent ? true : router.navigate([DASHBOARD_MAIN_ROUTES.DASHBOARD]),
              ),
            );
          },
        ],
      },
    ],
  },
];
