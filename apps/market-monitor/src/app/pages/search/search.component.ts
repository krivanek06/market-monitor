import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { NewsSearchComponent } from '@market-monitor/modules/market-general';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks';
import { DialogServiceModule } from '@market-monitor/shared-utils';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    // ReactiveFormsModule,
    MatButtonModule,
    DialogServiceModule,
    // StockSummaryTableComponent,
    // TabSelectControlComponent,
    // RangeDirective,
    NewsSearchComponent,
    StockSearchBasicCustomizedComponent,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  marketApiService = inject(MarketApiService);

  marketStockNews = toSignal(this.marketApiService.getNews('stocks'));
  //  marketOverview$: Observable<MarketTopPerformanceOverviewResponse> = this.marketApiService.getMarketOverview();

  /**
   * form control for top stocks
   */
  // topStockDisplayControl = new FormControl<keyof MarketOverTopStocks<unknown>>('stockTopActive', { nonNullable: true });

  displayInfoMobile = signal(false);

  // marketTopStocksOptions: LabelValue<keyof MarketOverTopStocks<unknown>>[] = [
  //   { label: 'Most Active', value: 'stockTopActive' },
  //   { label: 'Gainers', value: 'stockTopGainers' },
  //   { label: 'Losers', value: 'stockTopLosers' },
  // ];

  ngOnInit(): void {}

  toggleDisplayedValues(): void {
    this.displayInfoMobile.set(!this.displayInfoMobile());
  }
}
