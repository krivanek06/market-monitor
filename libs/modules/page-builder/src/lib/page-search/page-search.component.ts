import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService, StocksApiService } from '@market-monitor/api-client';
import { INDEXES_DEFAULT_SYMBOLS } from '@market-monitor/api-types';
import { NewsSearchComponent } from '@market-monitor/modules/market-general/features';
import { STOCK_SCREENER_DEFAULT_VALUES } from '@market-monitor/modules/market-stocks/data-access';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks/features';
import { CalendarRageToday } from '@market-monitor/shared/ui';
import { forkJoin, take } from 'rxjs';

@Component({
  selector: 'app-page-search',
  standalone: true,
  imports: [CommonModule, MatButtonModule, NewsSearchComponent, StockSearchBasicCustomizedComponent],
  template: `
    <div class="pt-[180px] pb-[260px] sm:pt-[200px] sm:pb-[300px]">
      <div class="max-w-[620px] mx-auto">
        <h1 class="text-xl text-center">Search Stock</h1>
        <app-stock-search-basic-customized></app-stock-search-basic-customized>
      </div>
    </div>

    <!-- news -->
    <div class="g-width-lg">
      <app-news-search [initialNewsToDisplay]="4" [searchData]="{ newsType: 'general' }"></app-news-search>
    </div>
  `,
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
      this.marketApiService.getSymbolSummaries(INDEXES_DEFAULT_SYMBOLS),
      this.marketApiService.getMarketCalendarDividends(month, year),
      this.marketApiService.getMarketOverview(),
    ])
      .pipe(take(1))
      .subscribe();
  }
}
