import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full',
      },
      {
        path: 'search',
        loadChildren: () =>
          import('./pages/search/search-routes').then((m) => m.route),
      },
      {
        path: 'stock-details:symbol',
        loadChildren: () =>
          import('./pages/stock-details/stock-details-routes').then(
            (m) => m.route
          ),
      },
    ],
  },
];
