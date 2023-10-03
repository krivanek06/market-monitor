import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MarketApiService } from '@market-monitor/api-client';
import { SymbolSummary } from '@market-monitor/api-types';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { StockSummaryTableComponent } from '@market-monitor/modules/market-stocks/ui';
import { RangeDirective } from '@market-monitor/shared/ui';
import { DialogServiceModule, SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-page-market-top-performers',
  standalone: true,
  imports: [
    CommonModule,
    StockSummaryTableComponent,
    MatButtonModule,
    MatDialogModule,
    RangeDirective,
    DialogServiceModule,
  ],
  templateUrl: './page-market-top-performers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PageMarketTopPerformersComponent {
  marketApiService = inject(MarketApiService);
  dialog = inject(MatDialog);
  marketTopPerformanceSignal = toSignal(this.marketApiService.getMarketTopPerformance());

  onSummaryClick(summary: SymbolSummary) {
    return this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
