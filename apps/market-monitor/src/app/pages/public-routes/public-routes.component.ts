import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceModule } from '@mm/shared/dialog-manager';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-public-routes',
  standalone: true,
  imports: [CommonModule, RouterModule, DialogServiceModule],
  template: `
    <nav
      class="flex sm:justify-center gap-6 sm:gap-4 pt-8 text-wt-gray-medium relative max-sm:overflow-scroll pb-6 max-sm:px-6"
    >
      <span class="hidden md:block absolute left-4 top-4 text-wt-gray-medium text-xs">Version {{ version }}</span>
      <a [routerLink]="['/']" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="is-active">Search</a>
      <a [routerLink]="[ROUTES_MAIN.STOCK_SCREENER]" routerLinkActive="is-active">Screener</a>
      <a [routerLink]="[ROUTES_MAIN.TOP_PERFORMERS]" routerLinkActive="is-active">Top Performers</a>
      <a [routerLink]="[ROUTES_MAIN.MARKET]" routerLinkActive="is-active">Market</a>
      <a [routerLink]="[ROUTES_MAIN.MARKET_CALENDAR]" routerLinkActive="is-active">Calendar</a>
    </nav>

    <section class="g-screen-size-default">
      <router-outlet></router-outlet>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    a {
      @apply transition-all duration-300 text-base hover:text-wt-gray-dark-strong;
      min-width: fit-content;
    }

    a.is-active {
      @apply text-wt-gray-dark-strong;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicRoutesComponent {
  ROUTES_MAIN = ROUTES_MAIN;
  version = environment.version;
}

export const route: Routes = [
  {
    path: '',
    component: PublicRoutesComponent,
    children: [
      {
        path: '',
        title: 'Search',
        loadComponent: () => import('./subpages/search.component').then((m) => m.SearchComponent),
      },
      {
        path: ROUTES_MAIN.STOCK_SCREENER,
        title: 'Stock Screener',
        loadComponent: () => import('./subpages/stock-screener.component').then((m) => m.StockScreenerComponent),
      },
      {
        path: ROUTES_MAIN.MARKET,
        title: 'Market',
        loadChildren: () => import('./subpages/market.component').then((m) => m.route),
      },
      {
        path: ROUTES_MAIN.MARKET_CALENDAR,
        title: 'Market Calendar',
        loadComponent: () => import('./subpages/calendar.component').then((m) => m.CalendarComponent),
      },
      {
        path: ROUTES_MAIN.TOP_PERFORMERS,
        title: 'Top Performers',
        loadComponent: () => import('./subpages/top-performers.component').then((m) => m.TopPerformersComponent),
      },
      {
        path: ROUTES_MAIN.CRYPTO,
        title: 'Crypto',
        loadComponent: () => import('./subpages/crypto.component').then((m) => m.CryptoComponent),
      },
    ],
  },
];
