import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  CompanyInsideTrade,
  DataTimePeriod,
  HistoricalPrice,
  News,
  StockDetails,
  StockEarning,
  StockMetricsHistoricalBasic,
  StockScreenerResults,
  StockScreenerValues,
  StockSummary,
  SymbolHistoricalPeriods,
  SymbolOwnershipHolders,
  SymbolOwnershipInstitutional,
} from '@market-monitor/api-types';
import { Observable, catchError, forkJoin, map, mergeMap, reduce, switchMap } from 'rxjs';
import { ApiCacheService } from './api-cache.service';
import { API_FUNCTION_URL, API_IS_PRODUCTION, constructCFEndpoint } from './api.model';

@Injectable({
  providedIn: 'root',
})
export class StocksApiService extends ApiCacheService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_FUNCTION_URL) private readonly endpointFunctions: string,
    @Inject(API_IS_PRODUCTION) private readonly isProd: boolean,
  ) {
    super(http);
  }

  searchStockSummariesByPrefix(ticker: string): Observable<StockSummary[]> {
    return this.getData<StockSummary[]>(
      `https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${ticker}&isSearch=true`,
      this.validity10Min,
    ).pipe(catchError(() => []));
  }

  getStockSummaries(symbols: string[]): Observable<StockSummary[]> {
    return this.getData<StockSummary[]>(
      `https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${symbols.join(',')}`,
      this.validity3Min,
    ).pipe(catchError(() => []));
  }

  getStockSummary(symbol: string): Observable<StockSummary | null> {
    return this.getStockSummaries([symbol]).pipe(map((d) => d[0] ?? null));
  }

  getStockDetails(symbol: string): Observable<StockDetails> {
    return this.getData<StockDetails>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getstockdetails', `symbol=${symbol}`),
      this.validity1Hour,
    );
  }

  getStockHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.getData<HistoricalPrice[]>(
      `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&period=${period}`,
    );
  }

  getStockHistoricalPricesOnDate(symbol: string, date: string): Observable<HistoricalPrice> {
    return this.getData<HistoricalPrice>(
      `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&date=${date}`,
      this.validity2Min,
    );
  }

  getStockScreening(screeningValue: StockScreenerValues): Observable<StockSummary[]> {
    return this.postData<StockScreenerResults[], StockScreenerValues>(
      'https://get-stock-screening.krivanek1234.workers.dev',
      screeningValue,
      this.validity5Min,
    ).pipe(
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
        forkJoin(symbolsChunks.map((chunk) => this.getStockSummaries(chunk).pipe(catchError(() => [])))),
      ),
      // flatten
      mergeMap((d) => d),
      // sort by ID
      map((d) => d.slice().sort((a, b) => a.id.localeCompare(b.id))),
      // Combine all summaries into a single array and emit only once
      reduce((acc, curr) => [...acc, ...curr], [] as StockSummary[]),
    );
  }

  getStockEarnings(symbol: string): Observable<StockEarning[]> {
    return this.getData<StockEarning[]>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getstockearnings', `symbol=${symbol}`),
      this.validity30Min,
    );
  }

  getStockHistoricalMetrics(
    symbol: string,
    period: DataTimePeriod = 'quarter',
  ): Observable<StockMetricsHistoricalBasic> {
    return this.getData<StockMetricsHistoricalBasic>(
      constructCFEndpoint(
        this.isProd,
        this.endpointFunctions,
        'getstockhistoricalmetrics',
        `symbol=${symbol}&timePeriod=${period}`,
      ),
      this.validity2Min,
    );
  }

  getStockOwnershipHoldersToDate(symbol: string, date: string): Observable<SymbolOwnershipHolders[]> {
    return this.getData<SymbolOwnershipHolders[]>(
      constructCFEndpoint(
        this.isProd,
        this.endpointFunctions,
        'getownershipholderstodate',
        `symbol=${symbol}&date=${date}`,
      ),
      this.validity1Hour,
    );
  }

  getStockOwnershipInstitutional(symbol: string): Observable<SymbolOwnershipInstitutional[]> {
    return this.getData<SymbolOwnershipInstitutional[]>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getownershipinstitutional', `symbol=${symbol}`),
      this.validity1Hour,
    );
  }

  getStockInsiderTrades(symbol: string): Observable<CompanyInsideTrade[]> {
    return this.getData<CompanyInsideTrade[]>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getstockinsidertrades', `symbol=${symbol}`),
      this.validity1Hour,
    );
  }

  getStockNews(symbol: string): Observable<News[]> {
    return this.getData<News[]>(
      `https://get-news.krivanek1234.workers.dev/?news_types=stocks&symbol=${symbol}`,
      this.validity30Min,
    );
  }
}
