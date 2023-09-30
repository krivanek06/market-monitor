import { Route } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

export const appRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MenuComponent,
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
        path: 'login',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
];
