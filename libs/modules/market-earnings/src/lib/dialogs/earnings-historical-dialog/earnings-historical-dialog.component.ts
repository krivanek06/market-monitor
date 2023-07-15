import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { StocksApiService } from '@market-monitor/api-client';
import { DialogCloseHeaderComponent } from '@market-monitor/shared-components';
import { EstimatedChartDataType } from '@market-monitor/shared-utils-client';
import { map } from 'rxjs';
import { EarningsEstimationChartComponent, RevenueEstimationChartComponent } from '../../components';

@Component({
  selector: 'app-earnings-historical-dialog',
  standalone: true,
  imports: [
    CommonModule,
    EarningsEstimationChartComponent,
    MatDialogModule,
    DialogCloseHeaderComponent,
    RevenueEstimationChartComponent,
    MatRadioModule,
    ReactiveFormsModule,
  ],
  templateUrl: './earnings-historical-dialog.component.html',
  styleUrls: ['./earnings-historical-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarningsHistoricalDialogComponent {
  selectedChartTypeControl = new FormControl<'earnings' | 'revenue'>('earnings');

  get isEarningsSelected(): boolean {
    return this.selectedChartTypeControl.value === 'earnings';
  }

  get isRevenueSelected(): boolean {
    return this.selectedChartTypeControl.value === 'revenue';
  }

  stockEarningsEstimationSignal = toSignal(
    this.stocksApiService.getStockEarnings(this.data.symbol).pipe(
      map((earnings) =>
        earnings
          .map(
            (earning) =>
              ({
                date: earning.date,
                valueActual: earning.eps,
                valueEst: earning.epsEstimated,
              } satisfies EstimatedChartDataType)
          )
          .reverse()
      )
    )
  );

  stockRevenueEstimationSignal = toSignal(
    this.stocksApiService.getStockEarnings(this.data.symbol).pipe(
      map((earnings) =>
        earnings
          .map(
            (earning) =>
              ({
                date: earning.date,
                valueActual: earning.revenue,
                valueEst: earning.revenueEstimated,
              } satisfies EstimatedChartDataType)
          )
          .reverse()
      )
    )
  );

  constructor(
    private dialogRef: MatDialogRef<EarningsHistoricalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService
  ) {
    this.selectedChartTypeControl.valueChanges.subscribe(console.log);
  }
}
