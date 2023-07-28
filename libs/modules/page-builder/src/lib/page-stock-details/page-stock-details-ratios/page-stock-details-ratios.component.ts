import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { GenericChartComponent } from '@market-monitor/shared-components';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-stock-details-ratios',
  standalone: true,
  imports: [CommonModule, GenericChartComponent],
  templateUrl: './page-stock-details-ratios.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsRatiosComponent {
  stocksApiService = inject(StocksApiService);
  route = inject(ActivatedRoute);
  private stockDetails$ = (this.route.parent as ActivatedRoute).data.pipe(
    map((data) => data['stockDetails'] as StockDetails)
  );

  stockHistoricalMetricsSignal = toSignal(
    this.stockDetails$.pipe(switchMap((details) => this.stocksApiService.getStockHistoricalMetrics(details.id)))
  );
}
