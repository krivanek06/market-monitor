import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockSummary } from '@market-monitor/api-types';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general/features';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';
import { DefaultImgDirective, PriceChangeItemsComponent } from '@market-monitor/shared/ui';
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
    <ng-container *ngIf="stockSummarySignal() as stockSummary; else showModalSkeleton">
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

        <div>
          <button mat-icon-button mat-dialog-close color="warn" type="button">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- action buttons -->
      <app-summary-action-buttons
        *ngIf="isSymbolTypeStock()"
        (redirectClickedEmitter)="onDetailsRedirect()"
        [symbolSummary]="stockSummary"
      ></app-summary-action-buttons>

      <mat-dialog-content>
        <!-- display main metrics -->
        <div *ngIf="isSymbolTypeStock()">
          <app-summary-main-metrics [stockSummary]="stockSummary"></app-summary-main-metrics>
        </div>

        <!-- time period change -->
        <div class="my-8">
          <app-price-change-items [mainSymbolPriceChange]="stockSummary.priceChange"></app-price-change-items>
        </div>

        <!-- price & volume -->
        <div class="max-w-full">
          <app-asset-price-chart-interactive
            [imageName]="data.symbol"
            [title]="data.symbol"
            [symbol]="data.symbol"
          ></app-asset-price-chart-interactive>
        </div>
      </mat-dialog-content>
    </ng-container>

    <!-- skeleton modal -->
    <ng-template #showModalSkeleton>
      <app-summary-modal-skeleton></app-summary-modal-skeleton>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSummaryDialogComponent {
  stockSummarySignal = signal<StockSummary | null>(null);

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
    private stocksApiService: StocksApiService,
    private dialogServiceUtil: DialogServiceUtil,
    private route: Router,
    private viewPortScroller: ViewportScroller,
  ) {
    this.stocksApiService
      .getStockSummary(this.data.symbol)
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
