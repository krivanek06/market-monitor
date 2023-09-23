import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { MarketApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { StocksApiService } from '@market-monitor/modules/market-stocks/data-access';
import { LoaderMainService } from '@market-monitor/shared/utils-client';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

export const stockDetailsResolver: ResolveFn<StockDetails | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const symbol = route.params['symbol'];

  const router = inject(Router);
  const stocksApiService = inject(StocksApiService);
  const marketApiService = inject(MarketApiService);
  const loaderMainService = inject(LoaderMainService);
  // const dialogServiceUtil = inject(DialogServiceUtil);

  if (!symbol) {
    router.navigate(['/']);
    return of(null);
  }

  // set loading to true
  loaderMainService.setLoading(true);

  // load multiple data at once
  return forkJoin([
    stocksApiService.getStockDetails(symbol),
    stocksApiService.getStockOwnershipInstitutional(symbol),
    stocksApiService.getStockHistoricalMetrics(symbol),
    stocksApiService.getStockInsiderTrades(symbol),
    marketApiService.getNews('stocks', symbol),
    // holders page
    stocksApiService
      .getStockOwnershipInstitutional(symbol)
      .pipe(switchMap((data) => stocksApiService.getStockOwnershipHoldersToDate(symbol, data[0]?.date ?? null))),
  ]).pipe(
    // return only details, everything else is cached
    map(([details, ...rest]) => details),
    tap(() => loaderMainService.setLoading(false)),
    catchError((err) => {
      loaderMainService.setLoading(false);
      // dialogServiceUtil.showNotificationBar(`An error happened getting data for symbol: ${symbol}`, 'error');
      router.navigate(['/']);
      return of(null);
    }),
  );
};
