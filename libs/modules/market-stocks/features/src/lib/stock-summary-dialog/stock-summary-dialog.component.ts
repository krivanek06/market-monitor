import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MarketApiService } from '@mm/api-client';
import { SymbolSummary } from '@mm/api-types';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, PriceChangeItemsComponent } from '@mm/shared/ui';
import { EMPTY, catchError } from 'rxjs';
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
    @if (stockSummarySignal(); as stockSummary) {
      <!-- heading -->
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <img appDefaultImg imageType="symbol" [src]="stockSummary.id" alt="Stock Image" class="w-11 h-11" />
          <div class="grid">
            <div class="flex gap-4 text-base text-wt-gray-medium">
              <span>{{ stockSummary.id }}</span>
              <span>|</span>
              <span>{{ symbolType() }}</span>
            </div>
            <span class="text-lg text-wt-gray-medium">{{ stockSummary.quote.name }}</span>
          </div>
        </div>

        <!-- action buttons -->
        <app-summary-action-buttons
          (redirectClickedEmitter)="onDetailsRedirect()"
          [symbolSummary]="stockSummary"
          [showRedirectButton]="isSymbolTypeStock()"
        />
      </div>

      <mat-dialog-content>
        <!-- display main metrics -->
        <div>
          <app-summary-main-metrics [stockSummary]="stockSummary" />
        </div>

        <!-- time period change -->
        <div class="mb-8 mt-4">
          <app-price-change-items [mainSymbolPriceChange]="stockSummary.priceChange" />
        </div>

        <!-- price & volume -->
        <div class="max-w-full">
          <app-asset-price-chart-interactive [imageName]="data.symbol" [title]="data.symbol" [symbol]="data.symbol" />
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
export class StockSummaryDialogComponent {
  stockSummarySignal = signal<SymbolSummary | null>(null);

  symbolType = computed(() => {
    const summary = this.stockSummarySignal();
    if (!summary || !summary.profile) {
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
  isSymbolTypeStock = computed(() => this.symbolType() === 'Stock' || this.symbolType() === 'ADR');

  constructor(
    private dialogRef: MatDialogRef<StockSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private marketApiService: MarketApiService,
    private dialogServiceUtil: DialogServiceUtil,
    private route: Router,
    private viewPortScroller: ViewportScroller,
  ) {
    this.marketApiService
      .getSymbolSummary(this.data.symbol)
      .pipe(
        catchError(() => EMPTY),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        console.log('res', res);
        if (!res) {
          this.dialogRef.close();
          this.dialogServiceUtil.showNotificationBar(`Summary for symbol: ${this.data.symbol} not found`, 'error');
          return;
        }
        this.stockSummarySignal.set(res);
      });
  }

  onDetailsRedirect(): void {
    // scroll to top
    this.viewPortScroller.scrollToPosition([0, 0]);

    // close dialog
    this.dialogRef.close({ redirect: true });

    // routing kept here, because component is used in multiple places
    this.route.navigateByUrl(`${ROUTES_MAIN.STOCK_DETAILS}/${this.data.symbol}`);
  }
}
