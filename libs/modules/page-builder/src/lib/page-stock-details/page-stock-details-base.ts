import { Directive, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketApiService, StocksApiService } from '@mm/api-client';
import { StockDetails } from '@mm/api-types';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { Observable, map } from 'rxjs';

@Directive()
export class PageStockDetailsBase {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly dialogServiceUtil = inject(DialogServiceUtil);
  protected readonly stocksApiService = inject(StocksApiService);
  protected readonly marketApiService = inject(MarketApiService);

  // get stock details from route data - can change from stock peers
  protected readonly stockDetails$ = this.route.parent?.data?.pipe(
    map((d) => d['stockDetails']),
  ) as Observable<StockDetails>;

  protected readonly stockDetailsSignal = toSignal(this.stockDetails$, {
    initialValue: this.route.parent?.snapshot.data['stockDetails'] as StockDetails,
  });
  protected readonly stockSymbolSignal = computed(() => this.stockDetailsSignal().id);
}
