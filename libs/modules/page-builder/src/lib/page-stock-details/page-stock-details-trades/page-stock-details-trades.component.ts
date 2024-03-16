import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StockInsiderTradesComponent } from '@mm/market-stocks/ui';
import { GeneralCardComponent, RangeDirective } from '@mm/shared/ui';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-trades',
  standalone: true,
  imports: [CommonModule, StockInsiderTradesComponent, GeneralCardComponent, RangeDirective],
  template: `
    <app-general-card title="Insider trades">
      <app-stock-insider-trades
        *ngIf="stockInsiderTradesSignal() as stockInsiderTrades; else showSkeleton"
        [data]="stockInsiderTrades"
      ></app-stock-insider-trades>
    </app-general-card>

    <!-- skeleton -->
    <ng-template #showSkeleton>
      <div>
        <div *ngRange="25" class="h-[50px] mb-1 g-skeleton"></div>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsTradesComponent extends PageStockDetailsBase {
  stockInsiderTradesSignal = toSignal(this.stocksApiService.getStockInsiderTrades(this.stockSymbolSignal()));
}
