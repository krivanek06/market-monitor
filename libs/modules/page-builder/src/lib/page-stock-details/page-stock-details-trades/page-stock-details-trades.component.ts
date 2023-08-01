import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StockInsiderTradesComponent } from '@market-monitor/modules/market-stocks';
import { GeneralCardComponent } from '@market-monitor/shared-components';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-trades',
  standalone: true,
  imports: [CommonModule, StockInsiderTradesComponent, GeneralCardComponent],
  templateUrl: './page-stock-details-trades.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsTradesComponent extends PageStockDetailsBase {
  stockInsiderTradesSignal = toSignal(this.stocksApiService.getStockInsiderTrades(this.stockSymbolSignal()));

  constructor() {
    super();
  }
}
