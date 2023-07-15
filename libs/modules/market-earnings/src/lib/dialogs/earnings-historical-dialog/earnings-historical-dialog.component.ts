import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { StocksApiService } from '@market-monitor/api-client';
import { DialogCloseHeaderComponent } from '@market-monitor/shared-components';
import { map } from 'rxjs';
import { EarningsChartComponent } from '../../components';
import { EarningsChartDataType } from '../../models';

@Component({
  selector: 'app-earnings-historical-dialog',
  standalone: true,
  imports: [CommonModule, EarningsChartComponent, MatDialogModule, DialogCloseHeaderComponent],
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
                epsActual: earning.eps,
                epsEst: earning.epsEstimated,
              } satisfies EarningsChartDataType)
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
