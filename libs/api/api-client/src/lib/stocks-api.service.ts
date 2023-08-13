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
  StockScreenerValues,
  StockSummary,
  SymbolHistoricalPeriods,
  SymbolOwnershipHolders,
  SymbolOwnershipInstitutional,
} from '@market-monitor/api-types';
import { Observable } from 'rxjs';
import { ENDPOINT_FUNCTION_URL } from './api-url.token';
import { ApiCacheService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class StocksApiService extends ApiCacheService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENDPOINT_FUNCTION_URL) private readonly endpointFunctions: string,
  ) {
    super(http);
  }

  searchStockSummariesByPrefix(ticker: string): Observable<StockSummary[]> {
    return this.getData<StockSummary[]>(
      `${this.endpointFunctions}/searchstocksbasic?symbol=${ticker}`,
      this.validity10Min,
    );
  }

  getStockSummaries(symbols: string[]): Observable<StockSummary[]> {
    return this.getData<StockSummary[]>(
      `${this.endpointFunctions}/getstocksummaries?symbol=${symbols.join(',')}`,
      this.validity10Min,
    );
  }

  getStockSummary(symbol: string): Observable<StockSummary> {
    return this.getData<StockSummary>(`${this.endpointFunctions}/getstocksummary?symbol=${symbol}`, this.validity10Min);
  }

  getStockDetails(symbol: string): Observable<StockDetails> {
    return this.getData<StockDetails>(`${this.endpointFunctions}/getstockdetails?symbol=${symbol}`, this.validity30Min);
  }

  getStockHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.getData<HistoricalPrice[]>(
      `${this.endpointFunctions}/getassethistoricalprices?symbol=${symbol}&period=${period}`,
    );
  }

  getStockHistoricalPricesOnDate(symbol: string, date: string): Observable<HistoricalPrice> {
    return this.getData<HistoricalPrice>(
      `${this.endpointFunctions}/getassethistoricalpricesondate?symbol=${symbol}&date=${date}`,
    );
  }

  getStockScreening(screeningValue: StockScreenerValues): Observable<StockSummary[]> {
    return this.http.post<StockSummary[]>(`${this.endpointFunctions}/getstockscreening`, screeningValue);
  }

  getStockEarnings(symbol: string): Observable<StockEarning[]> {
    return this.getData<StockEarning[]>(
      `${this.endpointFunctions}/getstockearnings?symbol=${symbol}`,
      this.validity30Min,
    );
  }

  getStockHistoricalMetrics(
    symbol: string,
    period: DataTimePeriod = 'quarter',
  ): Observable<StockMetricsHistoricalBasic> {
    return this.getData<StockMetricsHistoricalBasic>(
      `${this.endpointFunctions}/getstockhistoricalmetrics?symbol=${symbol}&timePeriod=${period}`,
      this.validity1Min,
    );
  }

  getStockOwnershipHoldersToDate(symbol: string, date: string): Observable<SymbolOwnershipHolders[]> {
    return this.getData<SymbolOwnershipHolders[]>(
      `${this.endpointFunctions}/getownershipholderstodate?symbol=${symbol}&date=${date}`,
      this.validity30Min,
    );
  }

  getStockOwnershipInstitutional(symbol: string): Observable<SymbolOwnershipInstitutional[]> {
    return this.getData<SymbolOwnershipInstitutional[]>(
      `${this.endpointFunctions}/getownershipinstitutional?symbol=${symbol}`,
      this.validity30Min,
    );
  }

  getStockInsiderTrades(symbol: string): Observable<CompanyInsideTrade[]> {
    return this.getData<CompanyInsideTrade[]>(
      `${this.endpointFunctions}/getstockinsidertrades?symbol=${symbol}`,
      this.validity30Min,
    );
  }

  getStockNews(symbol: string): Observable<News[]> {
    return this.getData<News[]>(
      `${this.endpointFunctions}/getmarketnews?news_types=stocks&symbol=${symbol}`,
      this.validity30Min,
    );
  }
}
