import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MarketApiService } from '@market-monitor/api-client';
import { StockSummary } from '@market-monitor/api-types';
import { StockSummaryDialogComponent, StockSummaryTableComponent } from '@market-monitor/modules/market-stocks';
import { RangeDirective } from '@market-monitor/shared-directives';
import { DialogServiceModule, SCREEN_DIALOGS } from '@market-monitor/shared-utils';

@Component({
  selector: 'app-top-performers',
  standalone: true,
  imports: [
    CommonModule,
    StockSummaryTableComponent,
    MatButtonModule,
    MatDialogModule,
    RangeDirective,
    DialogServiceModule,
  ],
  templateUrl: './top-performers.component.html',
  styleUrls: ['./top-performers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopPerformersComponent {
  marketApiService = inject(MarketApiService);
  dialog = inject(MatDialog);
  marketTopPerformanceSignal = toSignal(this.marketApiService.getMarketTopPerformance());

  onSummaryClick(summary: StockSummary) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
