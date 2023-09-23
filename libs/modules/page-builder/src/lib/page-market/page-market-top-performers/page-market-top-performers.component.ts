import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { StockSummary } from '@market-monitor/api-types';
import { MarketApiService } from '@market-monitor/modules/market-general/data-access';
import { ShowStockDialogDirective, StockSummaryTableComponent } from '@market-monitor/modules/market-stocks/ui';
import { RangeDirective } from '@market-monitor/shared/ui';
import { DialogServiceModule } from '@market-monitor/shared/utils-client';

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
  hostDirectives: [ShowStockDialogDirective],
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
  showStockDialogDirective = inject(ShowStockDialogDirective);
  marketTopPerformanceSignal = toSignal(this.marketApiService.getMarketTopPerformance());

  onSummaryClick(summary: StockSummary) {
    this.showStockDialogDirective.onShowSummary(summary.id);
  }
}
