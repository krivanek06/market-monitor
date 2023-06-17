import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MarketApiService } from '@market-monitor/api';
import { GeneralCardComponent, TabSelectControlComponent } from '@market-monitor/components';
import {
  StockBasicSearchComponent,
  StockStorageService,
  StockSummaryItemTableComponent,
  StockSummaryModalComponent,
  StockSummaryTableComponent,
} from '@market-monitor/modules/stock-visualization';
import {
  LabelValue,
  MarketOverTopStocks,
  MarketOverviewResponse,
  SCREEN_DIALOGS,
  StockSummary,
} from '@market-monitor/shared-types';
import { DialogServiceModule } from '@market-monitor/utils';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    StockBasicSearchComponent,
    GeneralCardComponent,
    ReactiveFormsModule,
    MatButtonModule,
    StockSummaryModalComponent,
    MatDialogModule,
    DialogServiceModule,
    StockSummaryItemTableComponent,
    StockSummaryTableComponent,
    TabSelectControlComponent,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  stockStorageService = inject(StockStorageService);
  marketApiService = inject(MarketApiService);
  dialog = inject(MatDialog);

  favoriteStocks$: Observable<StockSummary[]> = this.stockStorageService.getFavoriteStocks();
  searchedStocks$: Observable<StockSummary[]> = this.stockStorageService.getLastSearchedStocks();
  isStockSummaryLoaded$: Observable<boolean> = this.stockStorageService.isDataLoaded();
  marketOverview$: Observable<MarketOverviewResponse> = this.marketApiService.getMarketOverview();

  /**
   * form control for stock search
   */
  searchControl = new FormControl<StockSummary | null>(null);

  /**
   * form control for top stocks
   */
  topStockDisplayControl = new FormControl<keyof MarketOverTopStocks<unknown>>('stockTopActive', { nonNullable: true });

  showPriceSignal = signal(true);

  marketTopStocksOptions: LabelValue<keyof MarketOverTopStocks<unknown>>[] = [
    { label: 'Most Active', value: 'stockTopActive' },
    { label: 'Gainers', value: 'stockTopGainers' },
    { label: 'Losers', value: 'stockTopLosers' },
  ];

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
      if (value) {
        this.stockStorageService.addSearchStock(value.id);
        this.onSummaryClick(value);
      }
    });
  }

  toggleDisplayedValues(): void {
    this.showPriceSignal.set(!this.showPriceSignal());
  }

  onSummaryClick(summary: StockSummary) {
    this.dialog.open(StockSummaryModalComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
