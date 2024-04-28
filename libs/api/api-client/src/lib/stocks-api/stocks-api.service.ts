import { Injectable, inject } from '@angular/core';
import {
  CompanyInsideTrade,
  DataTimePeriod,
  News,
  StockDetails,
  StockDetailsAPI,
  StockEarning,
  StockMetricsHistoricalBasic,
  StockScreenerResults,
  StockScreenerValues,
  StockSummary,
  SymbolOwnershipHolders,
  SymbolOwnershipInstitutional,
  SymbolQuote,
  SymbolSummary,
} from '@mm/api-types';
import { Observable, catchError, filter, forkJoin, map, mergeMap, of, reduce, switchMap, tap } from 'rxjs';
import { MarketApiService } from '../market-api/market-api.service';
import { ApiCacheService } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class StocksApiService {
  private apiCache = inject(ApiCacheService);
  private marketApiService = inject(MarketApiService);

  searchStockSummariesByPrefix(ticker: string): Observable<SymbolSummary[]> {
    if (!ticker) {
      return of([]);
    }
    return this.apiCache
      .getData<
        SymbolSummary[]
      >(`https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${ticker}&isSearch=true`, ApiCacheService.validity10Min)
      .pipe(map((summaries) => summaries.filter((d) => d.quote.marketCap !== 0)));
  }

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

  getStockScreening(screeningValue: StockScreenerValues): Observable<SymbolQuote[]> {
    return this.apiCache
      .postData<
        StockScreenerResults[],
        StockScreenerValues
      >('https://get-stock-screening.krivanek1234.workers.dev', screeningValue, ApiCacheService.validity5Min)
      .pipe(
        map((stockScreeningResults) => {
          // create multiple requests
          const checkSize = 40;
          const symbolsChunks = stockScreeningResults
            .map((data) => data.symbol)
            .reduce((acc, symbol, index) => {
              // if (index % checkSize === 0) then create new array with symbol else add symbol to last array
              return index % checkSize === 0
                ? [...acc, [symbol]]
                : [...acc.slice(0, -1), [...acc[acc.length - 1], symbol]];
            }, [] as string[][]);

          return symbolsChunks;
        }),
        // load summaries for chunks
        switchMap((symbolsChunks) =>
          // return empty array on error
          forkJoin(
            symbolsChunks.map((chunk) => this.marketApiService.getSymbolQuotes(chunk).pipe(catchError(() => []))),
          ),
        ),
        // flatten
        mergeMap((d) => d),
        // sort by ID
        map((d) => d.slice().sort((a, b) => a.symbol.localeCompare(b.symbol))),
        // Combine all summaries into a single array and emit only once
        reduce((acc, curr) => [...acc, ...curr], [] as SymbolQuote[]),
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
