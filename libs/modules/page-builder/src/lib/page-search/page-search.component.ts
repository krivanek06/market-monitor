import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@mm/api-client';
import { NewsSearchComponent } from '@mm/market-general/features';
import { STOCK_SCREENER_DEFAULT_VALUES } from '@mm/market-stocks/data-access';
import { SymbolSearchBasicComponent } from '@mm/market-stocks/features';
import { CalendarRageToday } from '@mm/shared/ui';
import { forkJoin, take } from 'rxjs';

@Component({
  selector: 'app-page-search',
  standalone: true,
  imports: [CommonModule, MatButtonModule, NewsSearchComponent, SymbolSearchBasicComponent],
  template: `
    <div class="pt-[180px] pb-[260px] sm:pt-[200px] sm:pb-[300px]">
      <div class="max-w-[620px] mx-auto">
        <h1 class="text-2xl text-center">Search Stock</h1>
        <app-symbol-search-basic />
        <div class="text-xs text-wt-gray-medium -mt-3 pl-3">Ex: 'AAPL, MSFT, UBER, NFLX'</div>
      </div>
    </div>

    <!-- news -->
    @defer {
      <div class="max-w-[1280px] mx-auto">
        <app-news-search [initialNewsToDisplay]="4" [searchData]="{ newsType: 'general' }" />
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSearchComponent implements OnInit {
  marketApiService = inject(MarketApiService);

  marketStockNews = toSignal(this.marketApiService.getNews('stocks'));

  ngOnInit(): void {
    // preload some data to other pages without blocking the page
    const { year, month } = CalendarRageToday;
    forkJoin([
      this.marketApiService.getNews('general'),
      this.marketApiService.getMarketTopPerformance(),
      this.marketApiService.getStockScreening(STOCK_SCREENER_DEFAULT_VALUES),
      this.marketApiService.getMarketCalendarDividends(month, year),
    ])
      .pipe(take(1))
      .subscribe();
  }
}
