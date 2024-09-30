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
  imports: [StockSummaryTableComponent, MatButtonModule, MatDialogModule, RangeDirective, SectionTitleComponent],
  template: `
    <div class="grid gap-y-14">
      <div>
        <app-section-title title="Top Active" class="-mb-6 sm:mb-6" />
        @if (marketTopPerformance(); as marketOverview) {
          <app-stock-summary-table
            (itemClickedEmitter)="onQuoteClick($event)"
            [symbolQuotes]="marketOverview.stockTopActive"
          />
        } @else {
          <!-- skeleton -->
          <div class="max-sm:mt-12">
            <div *ngRange="15" class="g-skeleton mb-1 h-12"></div>
          </div>
        }
      </div>

      <div>
        <app-section-title title="Top Gainer" class="-mb-6 sm:mb-6" />
        @if (marketTopPerformance(); as marketOverview) {
          <app-stock-summary-table
            (itemClickedEmitter)="onQuoteClick($event)"
            [symbolQuotes]="marketOverview.stockTopGainers"
          />
        } @else {
          <!-- skeleton -->
          <div class="max-sm:mt-12">
            <div *ngRange="15" class="g-skeleton mb-1 h-12"></div>
          </div>
        }
      </div>

      <div>
        <app-section-title title="Top Losers" class="-mb-6 sm:mb-6" />
        @if (marketTopPerformance(); as marketOverview) {
          <app-stock-summary-table
            (itemClickedEmitter)="onQuoteClick($event)"
            [symbolQuotes]="marketOverview.stockTopLosers"
          />
        } @else {
          <!-- skeleton -->
          <div class="max-sm:mt-12">
            <div *ngRange="15" class="g-skeleton mb-1 h-12"></div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PageMarketTopPerformersComponent {
  private readonly marketApiService = inject(MarketApiService);
  private readonly dialog = inject(MatDialog);
  readonly marketTopPerformance = toSignal(this.marketApiService.getMarketTopPerformance());

  onQuoteClick(summary: SymbolQuote) {
    this.dialog.open(SymbolSummaryDialogComponent, {
      data: {
        symbol: summary.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
