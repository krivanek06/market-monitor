import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceModule } from '@mm/shared/dialog-manager';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-public-routes',
  standalone: true,
  imports: [CommonModule, RouterModule, DialogServiceModule],
  template: `
    <nav
      class="text-wt-gray-medium relative flex gap-6 pb-6 pt-8 max-sm:overflow-scroll max-sm:px-6 sm:justify-center sm:gap-4"
    >
      <span class="text-wt-gray-medium absolute left-4 top-4 hidden text-xs md:block">Version {{ version }}</span>
      <a [routerLink]="['/']" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="is-active">Search</a>
      <a [routerLink]="[ROUTES_MAIN.STOCK_SCREENER]" routerLinkActive="is-active">Screener</a>
      <a [routerLink]="[ROUTES_MAIN.TOP_PERFORMERS]" routerLinkActive="is-active">Top Performers</a>
      <a [routerLink]="[ROUTES_MAIN.MARKET]" routerLinkActive="is-active">Market</a>
      <a [routerLink]="[ROUTES_MAIN.MARKET_CALENDAR]" routerLinkActive="is-active">Calendar</a>
    </nav>

    <section class="g-screen-size-default">
      <router-outlet />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    a {
      @apply hover:text-wt-gray-dark-strong text-base transition-all duration-300;
      min-width: fit-content;
    }

    a.is-active {
      @apply text-wt-gray-dark-strong;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicRoutesComponent {
  readonly ROUTES_MAIN = ROUTES_MAIN;
  readonly version = environment.version;
}
