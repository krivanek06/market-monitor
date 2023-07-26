import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { catchError, of } from 'rxjs';

export const stockDetailsResolver: ResolveFn<StockDetails | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const symbol = route.params['symbol'];
  console.log('resolver', symbol);
  const router = inject(Router);
  const stocksApiService = inject(StocksApiService);
  // const dialogServiceUtil = inject(DialogServiceUtil);

  if (!symbol) {
    router.navigate(['/']);
    return of(null);
  }

  return stocksApiService.getStockDetails(symbol).pipe(
    catchError((err) => {
      // dialogServiceUtil.showNotificationBar(`An error happened getting data for symbol: ${symbol}`, 'error');
      router.navigate(['/']);
      return of(null);
    })
  );
};
