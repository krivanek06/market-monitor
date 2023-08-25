import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketApiService } from '@market-monitor/api-client';
import { environment } from 'apps/market-monitor/src/environments/environment';
import { ROUTES_PUBLIC_ROUTES } from '../../routes.model';

@Component({
  selector: 'app-public-routes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex justify-center gap-4 pt-8 text-wt-gray-medium relative">
      <span class="absolute left-4 text-wt-gray-medium text-xs">Version {{ version }}</span>
      <a [routerLink]="[ROUTES_PUBLIC_ROUTES.SEARCH]" routerLinkActive="is-active">Search</a>
      <a [routerLink]="[ROUTES_PUBLIC_ROUTES.STOCK_SCREENER]" routerLinkActive="is-active">Screener</a>
      <a [routerLink]="[ROUTES_PUBLIC_ROUTES.TOP_PERFORMERS]" routerLinkActive="is-active">Top Performers</a>
      <a [routerLink]="[ROUTES_PUBLIC_ROUTES.MARKET]" routerLinkActive="is-active">Market</a>
      <a [routerLink]="[ROUTES_PUBLIC_ROUTES.MARKET_CALENDAR]" routerLinkActive="is-active">Calendar</a>
      <!-- <a [routerLink]="ROUTES_PUBLIC_ROUTES.CRYPTO" routerLinkActive="is-active">Crypto</a> -->
    </nav>

    <section class="g-screen-size-default">
      <router-outlet></router-outlet>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      a {
        @apply transition-all duration-300 text-base hover:text-wt-gray-dark-strong;
      }

      a.is-active {
        @apply text-wt-gray-dark-strong;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicRoutesComponent {
  ROUTES_PUBLIC_ROUTES = ROUTES_PUBLIC_ROUTES;
  version = environment.version;
}

export const route: Routes = [
  {
    path: '',
    component: PublicRoutesComponent,
    children: [
      {
        path: '',
        redirectTo: ROUTES_PUBLIC_ROUTES.SEARCH,
        pathMatch: 'full',
      },
      {
        path: ROUTES_PUBLIC_ROUTES.SEARCH,
        title: 'Search',
        resolve: {
          generalNews: () => {
            const marketApiService = inject(MarketApiService);
            return marketApiService.getNews('general');
          },
        },
        loadComponent: () => import('./subpages/search.component').then((m) => m.SearchComponent),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.STOCK_SCREENER,
        title: 'Stock Screener',
        loadComponent: () => import('./subpages/stock-screener.component').then((m) => m.StockScreenerComponent),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.MARKET,
        title: 'Market',
        loadChildren: () => import('./subpages/market.component').then((m) => m.route),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.MARKET_CALENDAR,
        title: 'Market Calendar',
        loadComponent: () => import('./subpages/calendar.component').then((m) => m.CalendarComponent),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.TOP_PERFORMERS,
        title: 'Top Performers',
        loadComponent: () => import('./subpages/top-performers.component').then((m) => m.TopPerformersComponent),
      },
      {
        path: ROUTES_PUBLIC_ROUTES.CRYPTO,
        title: 'Crypto',
        loadComponent: () => import('./subpages/crypto.component').then((m) => m.CryptoComponent),
      },
    ],
  },
];
