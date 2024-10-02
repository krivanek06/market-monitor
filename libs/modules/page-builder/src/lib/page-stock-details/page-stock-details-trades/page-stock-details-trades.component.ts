import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StockInsiderTradesComponent } from '@mm/market-stocks/ui';
import { GeneralCardComponent, RangeDirective } from '@mm/shared/ui';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-trades',
  standalone: true,
  imports: [StockInsiderTradesComponent, GeneralCardComponent, RangeDirective],
  template: `
    <app-general-card title="Insider trades">
      @if (stockInsiderTradesSignal(); as stockInsiderTrades) {
        <app-stock-insider-trades [data]="stockInsiderTrades" />
      } @else {
        <!-- skeleton -->
        <div>
          <div *ngRange="25" class="g-skeleton mb-1 h-[50px]"></div>
        </div>
      }
    </app-general-card>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsTradesComponent extends PageStockDetailsBase {
  readonly stockInsiderTradesSignal = toSignal(this.stocksApiService.getStockInsiderTrades(this.stockSymbolSignal()));
}
