import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general';
import { UserUnauthenticatedService } from '@market-monitor/modules/user';
import { PriceChangeItemsComponent } from '@market-monitor/shared-components';
import { DefaultImgDirective } from '@market-monitor/shared-directives';
import { DialogServiceUtil } from '@market-monitor/shared-utils-client';
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
  stockSummarySignal = toSignal(this.stocksApiService.getStockSummary(this.data.symbol));
  stockSummaryType = computed(() => {
    const data = this.stockSummarySignal();
    if (!data) {
      return '';
    }
    if (data.profile.isAdr) {
      return 'ADR';
    }

    if (data.profile.isEtf) {
      return 'ETF';
    }

    if (data.profile.isFund) {
      return 'Fund';
    }

    return 'Stock';
  });
  isSymbolInFavoriteSignal = toSignal(this.userUnauthenticatedService.isSymbolInFavoriteObs(this.data.symbol));

  constructor(
    private dialogRef: MatDialogRef<StockSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService,
    private userUnauthenticatedService: UserUnauthenticatedService,
    private dialogServiceUtil: DialogServiceUtil,
    private route: Router,
    private viewPortScroller: ViewportScroller,
  ) {}

  onAddToFavorite(): void {
    if (this.userUnauthenticatedService.toggleFavoriteSymbol(this.data.symbol)) {
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.data.symbol} has been added into favorites`);
    } else {
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.data.symbol} has been removed from favorites`);
    }
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
