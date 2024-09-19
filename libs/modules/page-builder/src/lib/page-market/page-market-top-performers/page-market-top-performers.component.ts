import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote } from '@mm/api-types';
import { SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import { StockSummaryTableComponent } from '@mm/market-stocks/ui';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { RangeDirective, SectionTitleComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-page-market-top-performers',
  standalone: true,
  imports: [
    CommonModule,
    StockSummaryTableComponent,
    MatButtonModule,
    MatDialogModule,
    RangeDirective,
    SectionTitleComponent,
  ],
  template: `
    @if (marketTopPerformanceSignal(); as marketOverview) {
      <div class="grid gap-y-14">
        <div>
          <app-section-title title="Top Active" class="mb-6" />
          <app-stock-summary-table
            (itemClickedEmitter)="onQuoteClick($event)"
            [symbolQuotes]="marketOverview.stockTopActive"
          />
        </div>

        <div>
          <app-section-title title="Top Gainer" class="mb-6" />
          <app-stock-summary-table
            (itemClickedEmitter)="onQuoteClick($event)"
            [symbolQuotes]="marketOverview.stockTopGainers"
          />
        </div>

        <div>
          <app-section-title title="Top Losers" class="mb-6" />
          <app-stock-summary-table
            (itemClickedEmitter)="onQuoteClick($event)"
            [symbolQuotes]="marketOverview.stockTopLosers"
          />
        </div>
      </div>
    } @else {
      <!-- loading screen -->
      <div class="grid gap-y-14 pt-8">
        <div *ngRange="3">
          <div *ngRange="15" class="g-skeleton mb-1 h-12"></div>
        </div>
      </div>
    }
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
    this.dialog.open(SymbolSummaryDialogComponent, {
      data: {
        symbol: summary.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
