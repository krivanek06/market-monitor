import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { LoaderMainService } from '@market-monitor/shared-services';
import { catchError, of, tap } from 'rxjs';

export const stockDetailsResolver: ResolveFn<StockDetails | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const symbol = route.params['symbol'];

  const router = inject(Router);
  const stocksApiService = inject(StocksApiService);
  const loaderMainService = inject(LoaderMainService);
  // const dialogServiceUtil = inject(DialogServiceUtil);

  if (!symbol) {
    router.navigate(['/']);
    return of(null);
  }

  // set loading to true
  loaderMainService.setLoading(true);

  return stocksApiService.getStockDetails(symbol).pipe(
    tap(() => loaderMainService.setLoading(false)),
    catchError((err) => {
      loaderMainService.setLoading(false);
      // dialogServiceUtil.showNotificationBar(`An error happened getting data for symbol: ${symbol}`, 'error');
      router.navigate(['/']);
      return of(null);
    }),
  );
};
