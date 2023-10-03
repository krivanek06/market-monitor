import { inject } from '@angular/core';
import { Route } from '@angular/router';
import { AuthenticationAccountService } from '@market-monitor/modules/authentication/data-access';
import { map, tap } from 'rxjs';

export const appRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./menu/menu.component').then((m) => m.MenuComponent),
        canMatch: [
          () =>
            inject(AuthenticationAccountService)
              .getCurrentUserData()
              .pipe(map((userData) => (!!userData ? true : false))),
        ],
        //canMatch: [() => false],
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
          },
          {
            path: 'watchlist',
            loadComponent: () => import('./watchlist/watchlist.component').then((m) => m.WatchlistComponent),
          },
          {
            path: 'settings',
            loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
          },
          {
            path: 'trading',
            loadComponent: () => import('./trading/trading.component').then((m) => m.TradingComponent),
          },
        ],
      },
      {
        path: '',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
        canMatch: [
          () =>
            inject(AuthenticationAccountService)
              .getCurrentUserData()
              .pipe(
                tap((x) => console.log('login guard', x)),
                map((userData) => (!userData ? true : false)),
              ),
        ],
        //canMatch: [() => true],
      },
    ],
  },
];
