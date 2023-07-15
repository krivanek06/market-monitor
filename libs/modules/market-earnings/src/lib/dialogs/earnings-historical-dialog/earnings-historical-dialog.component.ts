import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { StocksApiService } from '@market-monitor/api-client';
import { DialogCloseHeaderComponent } from '@market-monitor/shared-components';
import { EstimatedChartDataType } from '@market-monitor/shared-utils-client';
import { map } from 'rxjs';
import { EarningsEstimationChartComponent } from '../../components';

@Component({
  selector: 'app-earnings-historical-dialog',
  standalone: true,
  imports: [CommonModule, EarningsEstimationChartComponent, MatDialogModule, DialogCloseHeaderComponent],
  templateUrl: './earnings-historical-dialog.component.html',
  styleUrls: ['./earnings-historical-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarningsHistoricalDialogComponent {
  stockEarningsSignal = toSignal(
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

  constructor(
    private dialogRef: MatDialogRef<EarningsHistoricalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService
  ) {}
}
