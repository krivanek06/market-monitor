import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api';
import {
  AssetPriceChartComponent,
  PriceChangeItemsComponent,
  TimePeriodButtonsComponent,
} from '@market-monitor/components';
import { DefaultImgDirective } from '@market-monitor/directives';
import { HistoricalPrice, StockSummary, SymbolHistoricalPeriods } from '@market-monitor/shared-types';
import { Observable, catchError, startWith, switchMap, tap } from 'rxjs';
import { SummaryMainMetricsComponent } from './summary-main-metrics/summary-main-metrics.component';

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

  constructor(
    private dialogRef: MatDialogRef<StockSummaryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService,
    private router: Router
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
            console.error(err);
            return [];
          })
        )
        .subscribe((prices) => {
          this.stockHistoricalPrice.set(prices);
        });
  }
}
