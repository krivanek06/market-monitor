import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NewsSearchComponent } from '@mm/market-general/features';
import { LabelValue, ROUTES_MAIN } from '@mm/shared/data-access';
import { TabSelectControlComponent } from '@mm/shared/ui';
import { PageCryptoComponent } from '../page-crypto/page-crypto.component';
import { PageMarketCalendarComponent } from './page-market-calendar/page-market-calendar.component';
import { PageMarketOverviewComponent } from './page-market-overview/page-market-overview.component';
import { PageMarketStockScreenerComponent } from './page-market-stock-screener/page-market-stock-screener.component';
import { PageMarketTopPerformersComponent } from './page-market-top-performers/page-market-top-performers.component';

@Component({
  selector: 'app-page-market',
  standalone: true,
  imports: [
    TabSelectControlComponent,
    ReactiveFormsModule,
    PageMarketCalendarComponent,
    PageMarketTopPerformersComponent,
    PageMarketStockScreenerComponent,
    PageMarketOverviewComponent,
    NewsSearchComponent,
    PageCryptoComponent,
  ],
  template: `
    <app-tab-select-control
      class="hidden xl:block"
      [formControl]="currentRouteControl"
      [displayOptions]="marketTabs"
      screenLayoutSplit="LAYOUT_LG"
    />

    <section>
      <!-- child routes -->
      @switch (currentRouteControl.value) {
        @case (ROUTES_MAIN.ECONOMICS) {
          <app-page-market-overview />
        }
        @case (ROUTES_MAIN.TOP_PERFORMERS) {
          <app-page-market-top-performers />
        }
        @case (ROUTES_MAIN.CRYPTO) {
          <app-page-crypto />
        }
        @case (ROUTES_MAIN.MARKET_CALENDAR) {
          <app-page-market-calendar />
        }
        @case (ROUTES_MAIN.STOCK_SCREENER) {
          <app-page-market-stock-screener />
        }
        @case (ROUTES_MAIN.NEWS) {
          <app-news-search [searchData]="{ newsType: 'general' }" />
        }
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMarketComponent {
  readonly ROUTES_MAIN = ROUTES_MAIN;
  readonly marketTabs: LabelValue<string>[] = [
    {
      label: 'Screener',
      value: ROUTES_MAIN.STOCK_SCREENER,
    },
    {
      label: 'Top Performers',
      value: ROUTES_MAIN.TOP_PERFORMERS,
    },
    {
      label: 'Economics',
      value: ROUTES_MAIN.ECONOMICS,
    },
    {
      label: 'Calendar',
      value: ROUTES_MAIN.MARKET_CALENDAR,
    },
    {
      label: 'News',
      value: ROUTES_MAIN.NEWS,
    },
  ];

  readonly currentRouteControl = new FormControl<string>(ROUTES_MAIN.TOP_PERFORMERS, { nonNullable: true });
}
