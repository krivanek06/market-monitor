import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote } from '@mm/api-types';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { StockSummaryTableComponent } from '@mm/market-stocks/ui';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { RangeDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-page-market-top-performers',
  standalone: true,
  imports: [CommonModule, StockSummaryTableComponent, MatButtonModule, MatDialogModule, RangeDirective],
  template: `
    <div *ngIf="marketTopPerformanceSignal() as marketOverview; else stockSummaryTableSkeleton" class="grid gap-y-14">
      <div>
        <app-stock-summary-table
          tableTitle="Top Active"
          (itemClickedEmitter)="onQuoteClick($event)"
          [symbolQuotes]="marketOverview.stockTopActive"
        ></app-stock-summary-table>
      </div>

      <div>
        <app-stock-summary-table
          tableTitle="Top Gainer"
          (itemClickedEmitter)="onQuoteClick($event)"
          [symbolQuotes]="marketOverview.stockTopGainers"
        ></app-stock-summary-table>
      </div>

      <div>
        <app-stock-summary-table
          tableTitle="Top Losers"
          (itemClickedEmitter)="onQuoteClick($event)"
          [symbolQuotes]="marketOverview.stockTopLosers"
        ></app-stock-summary-table>
      </div>
    </div>

    <!-- loading screen -->
    <ng-template #stockSummaryTableSkeleton>
      <div class="grid pt-2 gap-y-14">
        <div *ngRange="3">
          <div *ngRange="15" class="h-12 mb-1 g-skeleton"></div>
        </div>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PageMarketTopPerformersComponent {
  marketApiService = inject(MarketApiService);
  dialog = inject(MatDialog);
  marketTopPerformanceSignal = toSignal(this.marketApiService.getMarketTopPerformance());

  onQuoteClick(summary: SymbolQuote) {
    return this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
