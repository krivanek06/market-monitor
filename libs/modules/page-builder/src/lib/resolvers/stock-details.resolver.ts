import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { MarketApiService, StocksApiService } from '@mm/api-client';
import { StockDetails } from '@mm/api-types';
import { StorageLocalService } from '@mm/shared/storage-local';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';

export const stockDetailsResolver: ResolveFn<StockDetails | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const symbol = route.params['symbol'];

  const router = inject(Router);
  const stocksApiService = inject(StocksApiService);
  const marketApiService = inject(MarketApiService);
  const storageLocalService = inject(StorageLocalService);
  // const dialogServiceUtil = inject(DialogServiceUtil);

  if (!symbol) {
    router.navigate(['/']);
    return of(null);
  }

  // set loading to true
  storageLocalService.saveData('loader', {
    enabled: true,
  });

  // load multiple data at once
  return forkJoin([
    stocksApiService.getStockDetails(symbol),
    stocksApiService.getStockOwnershipInstitutional(symbol),
    stocksApiService.getStockHistoricalMetrics(symbol),
    stocksApiService.getStockInsiderTrades(symbol),
    marketApiService.getNews('stocks', symbol),
    // holders page

    // stocksApiService
    //   .getStockOwnershipInstitutional(symbol)
    //   .pipe(switchMap((data) => stocksApiService.getStockOwnershipHoldersToDate(symbol, data[0]?.date ?? null))),
  ]).pipe(
    // return only details, everything else is cached
    map(([details, ...rest]) => details),
    catchError((err) => {
      // dialogServiceUtil.showNotificationBar(`An error happened getting data for symbol: ${symbol}`, 'error');
      router.navigate(['/']);
      return of(null);
    }),
    finalize(() =>
      storageLocalService.saveData('loader', {
        enabled: false,
      }),
    ),
  );
};
