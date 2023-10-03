import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { SymbolSummary } from '@market-monitor/api-types';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general/features';
import { DefaultImgDirective, PriceChangeItemsComponent } from '@market-monitor/shared/ui';
import { DialogServiceModule, DialogServiceUtil } from '@market-monitor/shared/utils-client';
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
    DialogServiceModule,
    SummaryActionButtonsComponent,
  ],
  templateUrl: './stock-summary-dialog.component.html',
  styleUrls: ['./stock-summary-dialog.component.scss'],
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
    this.route.navigate(['stock-details', this.data.symbol]);
  }
}
