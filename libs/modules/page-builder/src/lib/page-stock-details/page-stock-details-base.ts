import { Directive, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { DialogServiceUtil } from '@market-monitor/shared-utils-client';

@Directive()
export class PageStockDetailsBase {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialogServiceUtil = inject(DialogServiceUtil);
  stocksApiService = inject(StocksApiService);

  // get stock details from route data
  stockDetails = this.route.parent?.snapshot.data?.['stockDetails'] as StockDetails;

  stockDetailsSignal = signal(this.stockDetails);
  stockSymbolSignal = computed(() => this.stockDetailsSignal().id);
}
