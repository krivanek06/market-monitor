import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api';
import { AssetPriceChartComponent, DialogCloseHeaderComponent } from '@market-monitor/components';
import { HistoricalPrice, StockSummary, SymbolHistoricalPeriods } from '@market-monitor/shared-types';
import { Observable, startWith, switchMap } from 'rxjs';
import { SummaryMainMetricsComponent } from './summary-main-metrics/summary-main-metrics.component';

@Component({
  selector: 'app-stock-summary-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogCloseHeaderComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    AssetPriceChartComponent,
    SummaryMainMetricsComponent,
  ],
  templateUrl: './stock-summary-modal.component.html',
  styleUrls: ['./stock-summary-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSummaryModalComponent implements OnInit {
  stockSummary$!: Observable<StockSummary>;
  stockHistoricalPrice$!: Observable<HistoricalPrice[]>;

  historicalPeriodFormControl = new FormControl<SymbolHistoricalPeriods>(SymbolHistoricalPeriods.week, {
    nonNullable: true,
  });

  constructor(
    private dialogRef: MatDialogRef<StockSummaryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stockSummary$ = this.stocksApiService.getStockSummary(this.data.symbol);
    this.stockHistoricalPrice$ = this.historicalPeriodFormControl.valueChanges.pipe(
      startWith(this.historicalPeriodFormControl.value),
      switchMap((period) => this.stocksApiService.getSymbolHistoricalPrices(this.data.symbol, period))
    );

    this.stockHistoricalPrice$.subscribe((prices) => {
      console.log('prices');
      console.log(prices);
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
