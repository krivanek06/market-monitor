import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { MarketTopPerformanceOverviewResponse } from '@market-monitor/api-types';
import {
  StockSearchBasicCustomizedComponent,
  StockSummaryTableComponent,
} from '@market-monitor/modules/stock-visualization';
import { TabSelectControlComponent } from '@market-monitor/shared-components';
import { RangeDirective } from '@market-monitor/shared-directives';
import { DialogServiceModule } from '@market-monitor/shared-utils';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    DialogServiceModule,
    StockSummaryTableComponent,
    TabSelectControlComponent,
    RangeDirective,
    StockSearchBasicCustomizedComponent,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  marketApiService = inject(MarketApiService);

  marketOverview$: Observable<MarketTopPerformanceOverviewResponse> = this.marketApiService.getMarketOverview();

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
