import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { StocksApiService } from '@market-monitor/api-cloud-functions';
import { StockSummary } from '@market-monitor/api-types';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general';
import { PriceChangeItemsComponent } from '@market-monitor/shared-components';
import { DefaultImgDirective } from '@market-monitor/shared-directives';
import { DialogServiceUtil } from '@market-monitor/shared-utils';
import { Observable } from 'rxjs';
import { StockStorageService } from '../../services';
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
  stockSummary$!: Observable<StockSummary>;

  isSymbolInFavoriteSignal = toSignal(this.stockStorageService.isSymbolInFavoriteObs(this.data.symbol));

  constructor(
    private dialogRef: MatDialogRef<StockSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService,
    private stockStorageService: StockStorageService,
    private dialogServiceUtil: DialogServiceUtil
  ) {
    this.stockSummary$ = this.stocksApiService.getStockSummary(this.data.symbol);
  }

  onAddToFavorite(): void {
    if (this.stockStorageService.toggleFavoriteSymbol(this.data.symbol)) {
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.data.symbol} has been added into favorites`);
    } else {
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.data.symbol} has been removed from favorites`);
    }
  }

  onDetailsRedirect(): void {
    this.dialogRef.close({ redirect: true });
  }
}
