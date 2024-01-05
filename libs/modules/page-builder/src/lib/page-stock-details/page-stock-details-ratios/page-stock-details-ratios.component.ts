import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GenericChartComponent, RangeDirective } from '@market-monitor/shared/ui';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-ratios',
  standalone: true,
  imports: [CommonModule, GenericChartComponent, RangeDirective],
  templateUrl: './page-stock-details-ratios.component.html',
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsRatiosComponent extends PageStockDetailsBase {
  stockHistoricalMetricsSignal = toSignal(this.stocksApiService.getStockHistoricalMetrics(this.stockSymbolSignal()));

  constructor() {
    super();
  }
}
