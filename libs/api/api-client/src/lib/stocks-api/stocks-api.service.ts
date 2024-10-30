import { Injectable, inject } from '@angular/core';
import {
  CompanyInsideTrade,
  DataTimePeriod,
  News,
  StockDetails,
  StockDetailsAPI,
  StockEarning,
  StockMetricsHistoricalBasic,
  StockSummary,
  SymbolOwnershipHolders,
  SymbolOwnershipInstitutional,
} from '@mm/api-types';
import { Observable, filter, map, switchMap, tap } from 'rxjs';
import { MarketApiService } from '../market-api/market-api.service';
import { ApiCacheService } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class StocksApiService {
  private readonly apiCache = inject(ApiCacheService);
  private readonly marketApiService = inject(MarketApiService);

  getStockDetails(symbol: string): Observable<StockDetails> {
    return this.marketApiService.getSymbolSummary(symbol).pipe(
      tap((summary) => {
        if (!summary || !summary.profile) {
          throw new Error('Invalid symbol');
        }

        // prevent loading data for etf and funds
        if (summary.profile.isEtf) {
          throw new Error('Unable to get details for ETF');
        }
      }),
      filter((d): d is StockSummary => !!d),
      switchMap((summary) =>
        this.apiCache
          .getData<StockDetailsAPI>(
            `https://get-stock-data.krivanek1234.workers.dev/?type=stock-details&symbol=${symbol}`,
            ApiCacheService.validity1Hour,
          )
          .pipe(
            map((details) => {
              return {
                ...summary,
                ...details,
              };
            }),
          ),
      ),
    );
  }

  getStockEarnings(symbol: string): Observable<StockEarning[]> {
    return this.apiCache.getData<StockEarning[]>(
      `https://get-stock-data.krivanek1234.workers.dev/?type=stock-earnings&symbol=${symbol}`,
      ApiCacheService.validity30Min,
    );
  }

  getStockHistoricalMetrics(
    symbol: string,
    period: DataTimePeriod = 'quarter',
  ): Observable<StockMetricsHistoricalBasic> {
    return this.apiCache.getData<StockMetricsHistoricalBasic>(
      `https://get-stock-data.krivanek1234.workers.dev/?type=stock-historical-metrics&symbol=${symbol}&timePeriod=${period}`,
      ApiCacheService.validity2Min,
    );
  }

  getStockOwnershipHoldersToDate(symbol: string, date: string): Observable<SymbolOwnershipHolders[]> {
    return this.apiCache.getData<SymbolOwnershipHolders[]>(
      `https://get-stock-data.krivanek1234.workers.dev/?type=stock-ownership-holders-to-date&symbol=${symbol}&date=${date}`,
      ApiCacheService.validity1Hour,
    );
  }

  getStockOwnershipInstitutional(symbol: string): Observable<SymbolOwnershipInstitutional[]> {
    return this.apiCache.getData<SymbolOwnershipInstitutional[]>(
      `https://get-stock-data.krivanek1234.workers.dev/?type=stock-ownership-institutional&symbol=${symbol}`,
      ApiCacheService.validity1Hour,
    );
  }

  getStockInsiderTrades(symbol: string): Observable<CompanyInsideTrade[]> {
    return this.apiCache.getData<CompanyInsideTrade[]>(
      `https://get-stock-data.krivanek1234.workers.dev/?type=stock-insider-trades&symbol=${symbol}`,
      ApiCacheService.validity1Hour,
    );
  }

  getStockNews(symbol: string): Observable<News[]> {
    return this.apiCache.getData<News[]>(
      `https://get-news.krivanek1234.workers.dev/?news_types=stocks&symbol=${symbol}`,
      ApiCacheService.validity30Min,
    );
  }
}
