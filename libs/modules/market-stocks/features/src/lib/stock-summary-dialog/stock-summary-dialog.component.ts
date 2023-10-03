import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { SymbolSummary } from '@market-monitor/api-types';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general/features';
import { SymbolFavoriteService } from '@market-monitor/modules/market-stocks/data-access';
import { DefaultImgDirective, PriceChangeItemsComponent } from '@market-monitor/shared/ui';
import { DialogServiceUtil } from '@market-monitor/shared/utils-client';
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
  ],
  templateUrl: './stock-summary-dialog.component.html',
  styleUrls: ['./stock-summary-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSummaryDialogComponent {
  stockSummarySignal = signal<SymbolSummary | null>(null);
  isSymbolInFavoriteSignal = toSignal(this.symbolFavoriteService.isSymbolInFavoriteObs(this.data.symbol));
  symbolType = computed(() => {
    const summary = this.stockSummarySignal();
    if (!summary) {
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

  constructor(
    private dialogRef: MatDialogRef<StockSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService,
    private symbolFavoriteService: SymbolFavoriteService,
    private dialogServiceUtil: DialogServiceUtil,
    private route: Router,
    private viewPortScroller: ViewportScroller,
  ) {
    this.stocksApiService
      .getStockSummary(this.data.symbol)
      .pipe(takeUntilDestroyed())
      .subscribe((res) => {
        if (!res) {
          this.dialogRef.close();
          this.dialogServiceUtil.showNotificationBar(`Summary for symbol: ${this.data.symbol} not found`, 'error');
          return;
        }
        this.stockSummarySignal.set(res);
      });
  }

  onAddToFavorite(): void {
    this.symbolFavoriteService.addFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.data.symbol,
    });
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.data.symbol} has been added into favorites`);
  }

  onRemoveToFavorite(): void {
    this.symbolFavoriteService.removeFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.data.symbol,
    });
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.data.symbol} has been removed from favorites`);
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
