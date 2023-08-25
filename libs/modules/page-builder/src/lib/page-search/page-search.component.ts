import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService, StocksApiService } from '@market-monitor/api-client';
import { INDEXES_DEFAULT_SYMBOLS } from '@market-monitor/api-types';
import { NewsSearchComponent } from '@market-monitor/modules/market-general';
import {
  STOCK_SCREENER_DEFAULT_VALUES,
  StockSearchBasicCustomizedComponent,
} from '@market-monitor/modules/market-stocks';
import { CalendarRageToday } from '@market-monitor/shared-components';
import { DialogServiceModule } from '@market-monitor/shared-utils-client';
import { forkJoin, take } from 'rxjs';

@Component({
  selector: 'app-page-search',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    DialogServiceModule,
    NewsSearchComponent,
    StockSearchBasicCustomizedComponent,
  ],
  templateUrl: './page-search.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSearchComponent implements OnInit {
  marketApiService = inject(MarketApiService);
  stocksApiService = inject(StocksApiService);

  marketStockNews = toSignal(this.marketApiService.getNews('stocks'));

  ngOnInit(): void {
    // preload some data to other pages without blocking the page
    const { year, month } = CalendarRageToday;
    forkJoin([
      this.marketApiService.getNews('general'),
      this.marketApiService.getMarketTopPerformance(),
      this.stocksApiService.getStockScreening(STOCK_SCREENER_DEFAULT_VALUES),
      this.marketApiService.getQuotesBySymbols(INDEXES_DEFAULT_SYMBOLS),
      this.marketApiService.getMarketCalendarDividends(month, year),
      this.marketApiService.getMarketOverview(),
    ])
      .pipe(take(1))
      .subscribe();
  }
}
