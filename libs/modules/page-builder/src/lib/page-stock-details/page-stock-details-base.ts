import { Directive, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';
import { Observable, map } from 'rxjs';

@Directive()
export class PageStockDetailsBase {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialogServiceUtil = inject(DialogServiceUtil);
  stocksApiService = inject(StocksApiService);

  // get stock details from route data - can change from stock peers
  stockDetails$ = this.route.parent?.data?.pipe(map((d) => d['stockDetails'])) as Observable<StockDetails>;

  stockDetailsSignal = toSignal(this.stockDetails$, {
    initialValue: this.route.parent?.snapshot.data['stockDetails'] as StockDetails,
  });
  stockSymbolSignal = computed(() => this.stockDetailsSignal().id);
}
