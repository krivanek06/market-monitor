import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MarketApiService } from '@mm/api-client';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, PriceChangeItemsComponent } from '@mm/shared/ui';
import { catchError, of } from 'rxjs';
import { SummaryActionButtonsComponent } from './summary-action-buttons/summary-action-buttons.component';
import { SummaryMainMetricsComponent } from './summary-main-metrics/summary-main-metrics.component';
import { SummaryModalSkeletonComponent } from './summary-modal-skeleton/summary-modal-skeleton.component';

@Component({
  selector: 'app-stock-summary-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DefaultImgDirective,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SummaryMainMetricsComponent,
    PriceChangeItemsComponent,
    SummaryModalSkeletonComponent,
    AssetPriceChartInteractiveComponent,
    SummaryActionButtonsComponent,
  ],
  template: `
    @if (symbolSummary(); as symbolSummary) {
      <!-- heading -->
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <img appDefaultImg imageType="symbol" [src]="symbolSummary.id" alt="Stock Image" class="h-11 w-11" />
          <div class="grid">
            <div class="text-wt-gray-medium flex gap-4 text-base">
              <span>{{ symbolSummary.quote.displaySymbol }}</span>
              <span>|</span>
              <span>{{ symbolType() }}</span>
            </div>
            <span class="text-wt-gray-medium text-lg">{{ symbolSummary.quote.name }}</span>
          </div>
        </div>

        <!-- action buttons -->
        <app-summary-action-buttons [symbolSummary]="symbolSummary" [showRedirectButton]="isSymbolTypeStock()" />
      </div>

      <mat-dialog-content>
        <!-- display main metrics -->
        <div>
          <app-summary-main-metrics [stockSummary]="symbolSummary" />
        </div>

        <!-- time period change -->
        <div class="mb-8 mt-4">
          <app-price-change-items [mainSymbolPriceChange]="symbolSummary.priceChange" />
        </div>

        <!-- price & volume -->
        <div class="max-w-full">
          <app-asset-price-chart-interactive
            [imageName]="data.symbol"
            [title]="data.symbol"
            [symbol]="data.symbol"
            [errorFromParent]="!symbolSummary.priceChange['5D']"
          />
        </div>
      </mat-dialog-content>
    } @else {
      <!-- skeleton modal -->
      <app-summary-modal-skeleton />
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SymbolSummaryDialogComponent {
  private readonly marketApiService = inject(MarketApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly dialogRef = inject(MatDialogRef<SymbolSummaryDialogComponent>);
  readonly data = inject<{ symbol: string }>(MAT_DIALOG_DATA);

  readonly symbolSummary = toSignal(
    this.marketApiService.getSymbolSummary(this.data.symbol).pipe(
      catchError(() => {
        this.dialogRef.close();
        this.dialogServiceUtil.showNotificationBar(`Summary for symbol: ${this.data.symbol} not found`, 'error');
        return of(undefined);
      }),
    ),
  );

  readonly symbolType = computed(() => {
    const summary = this.symbolSummary();

    if (!summary) {
      return null;
    }

    if (summary.quote.exchange === 'CRYPTO') {
      return 'Crypto';
    }

    if (!summary.profile) {
      return null;
    }

    if (summary.profile?.isEtf) {
      return 'ETF';
    }

    if (summary.profile?.isAdr) {
      return 'ADR';
    }

    if (summary.profile?.isFund) {
      return 'FUND';
    }

    return 'Stock';
  });
  readonly isSymbolTypeStock = computed(() => this.symbolType() === 'Stock' || this.symbolType() === 'ADR');
}
