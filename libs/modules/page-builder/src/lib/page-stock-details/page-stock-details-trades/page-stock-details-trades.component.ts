import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { StockInsiderTradesComponent } from '@market-monitor/modules/market-stocks';
import { GeneralCardComponent } from '@market-monitor/shared-components';
import { map } from 'rxjs';

@Component({
  selector: 'app-page-stock-details-trades',
  standalone: true,
  imports: [CommonModule, StockInsiderTradesComponent, GeneralCardComponent],
  templateUrl: './page-stock-details-trades.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsTradesComponent {
  route = inject(ActivatedRoute);
  stocksApiService = inject(StocksApiService);

  private stockDetails$ = (this.route.parent as ActivatedRoute).data.pipe(
    map((data) => data['stockDetails'] as StockDetails)
  );

  stockDetailsSignal = toSignal(this.stockDetails$);
}
