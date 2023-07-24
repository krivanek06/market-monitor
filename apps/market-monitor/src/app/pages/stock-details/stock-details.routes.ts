import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { catchError, of } from 'rxjs';
import { ROUTES_STOCK_DETAILS } from '../../routes.model';
import { StockDetailsFinancialsComponent } from './stock-details-financials/stock-details-financials.component';
import { StockDetailsOverviewComponent } from './stock-details-overview/stock-details-overview.component';
import { StockDetailsRatiosComponent } from './stock-details-ratios/stock-details-ratios.component';
import { StockDetailsTradesComponent } from './stock-details-trades/stock-details-trades.component';
import { StockDetailsComponent } from './stock-details.component';

const stockDetailsResolver: ResolveFn<StockDetails | null> = (
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

export const route: Routes = [
  {
    path: '',
    component: StockDetailsComponent,
    resolve: {
      stockDetails: stockDetailsResolver,
    },
    children: [
      {
        path: '',
        redirectTo: ROUTES_STOCK_DETAILS.OVERVIEW,
        pathMatch: 'full',
      },
      {
        path: ROUTES_STOCK_DETAILS.OVERVIEW,
        component: StockDetailsOverviewComponent,
      },
      {
        path: ROUTES_STOCK_DETAILS.TRADES,
        component: StockDetailsTradesComponent,
      },
      {
        path: ROUTES_STOCK_DETAILS.FINANCIALS,
        component: StockDetailsFinancialsComponent,
      },
      {
        path: ROUTES_STOCK_DETAILS.RATIOS,
        component: StockDetailsRatiosComponent,
      },
    ],
  },
];
