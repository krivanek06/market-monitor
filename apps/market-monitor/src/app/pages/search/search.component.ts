import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MarketApiService } from '@market-monitor/api';
import { GeneralCardComponent } from '@market-monitor/components';
import {
  StockBasicSearchComponent,
  StockStorageService,
  StockSummaryItemTableComponent,
  StockSummaryModalComponent,
  StockSummaryTableComponent,
} from '@market-monitor/modules/stock-visualization';
import { MarketOverviewResponse, SCREEN_DIALOGS, StockSummary } from '@market-monitor/shared-types';
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

  searchControl = new FormControl<StockSummary | null>(null);

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
      if (value) {
        this.stockStorageService.addSearchStock(value.id);
        this.onSummaryClick(value);
      }
    });
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
