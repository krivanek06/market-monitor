import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StocksApiService } from '@market-monitor/api';
import {
  AssetPriceChartComponent,
  PriceChangeItemsComponent,
  TimePeriodButtonsComponent,
} from '@market-monitor/components';
import { DefaultImgDirective } from '@market-monitor/directives';
import { ErrorEnum, HistoricalPrice, StockSummary, SymbolHistoricalPeriods } from '@market-monitor/shared-types';
import { DialogServiceUtil } from '@market-monitor/utils';
import { Observable, catchError, startWith, switchMap, tap } from 'rxjs';
import { StockStorageService } from '../../services';
import { SummaryMainMetricsComponent } from './summary-main-metrics/summary-main-metrics.component';
import { SummaryModalSkeletonComponent } from './summary-modal-skeleton/summary-modal-skeleton.component';
@Component({
  selector: 'app-stock-summary-modal',
  standalone: true,
  imports: [
    CommonModule,
    DefaultImgDirective,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    AssetPriceChartComponent,
    SummaryMainMetricsComponent,
    TimePeriodButtonsComponent,
    PriceChangeItemsComponent,
    MatTooltipModule,
    SummaryModalSkeletonComponent,
  ],
  templateUrl: './stock-summary-modal.component.html',
  styleUrls: ['./stock-summary-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSummaryModalComponent {
  stockSummary$!: Observable<StockSummary>;
  stockHistoricalPrice = signal<HistoricalPrice[]>([]);

  timePeriodFormControl = new FormControl<SymbolHistoricalPeriods>(SymbolHistoricalPeriods.week, {
    nonNullable: true,
  });

  isSymbolInFavoriteSignal = toSignal(this.stockStorageService.isSymbolInFavoriteObs(this.data.symbol));

  constructor(
    private dialogRef: MatDialogRef<StockSummaryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService,
    private stockStorageService: StockStorageService,
    private dialogServiceUtil: DialogServiceUtil
  ) {
    (this.stockSummary$ = this.stocksApiService.getStockSummary(this.data.symbol)),
      // load prices by selected time period
      this.timePeriodFormControl.valueChanges
        .pipe(
          startWith(this.timePeriodFormControl.value),
          tap(() => this.stockHistoricalPrice.set([])),
          switchMap((period) => this.stocksApiService.getStockHistoricalPrices(this.data.symbol, period)),
          takeUntilDestroyed(),
          catchError((err) => {
            console.log(err);
            this.dialogServiceUtil.showNotificationBar(ErrorEnum.CLIENT_GENERAL_ERROR, 'error');
            return [];
          })
        )
        .subscribe((prices) => {
          this.stockHistoricalPrice.set(prices);
        });
  }

  onAddToFavorite(): void {
    if (this.stockStorageService.toggleFavoriteSymbol(this.data.symbol)) {
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.data.symbol} has been added into favorites`);
    } else {
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.data.symbol} has been removed from favorites`);
    }
  }

  onDetailsRedirect(): void {
    this.dialogRef.close({ redirect: true });
  }
}
