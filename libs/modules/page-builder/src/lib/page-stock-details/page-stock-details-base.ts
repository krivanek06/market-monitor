import { Directive, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketApiService, StocksApiService } from '@mm/api-client';
import { StockDetails } from '@mm/api-types';

@Directive()
export class PageStockDetailsBase {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly stocksApiService = inject(StocksApiService);
  protected readonly marketApiService = inject(MarketApiService);

  readonly stockDetailsSignal = input.required<StockDetails>();
  protected readonly stockSymbolSignal = computed(() => this.stockDetailsSignal().id);
}
