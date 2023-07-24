import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  HistoricalPrice,
  StockDetails,
  StockEarning,
  StockScreenerValues,
  StockSummary,
  SymbolHistoricalPeriods,
} from '@market-monitor/api-types';
import { Observable, retry } from 'rxjs';
import { ENDPOINT_FUNCTION_URL } from './api-url.token';

@Injectable({
  providedIn: 'root',
})
export class StocksApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENDPOINT_FUNCTION_URL) private readonly endpointFunctions: string
  ) {}

  searchStockSummariesByPrefix(ticker: string): Observable<StockSummary[]> {
    return this.http.get<StockSummary[]>(`${this.endpointFunctions}/searchstocksbasic?symbol=${ticker}`);
  }

  getStockSummaries(symbols: string[]): Observable<StockSummary[]> {
    return this.http.get<StockSummary[]>(`${this.endpointFunctions}/getstocksummaries?symbol=${symbols.join(',')}`);
  }

  getStockSummary(symbol: string): Observable<StockSummary> {
    return this.http.get<StockSummary>(`${this.endpointFunctions}/getstocksummary?symbol=${symbol}`);
  }

  getStockDetails(symbol: string): Observable<StockDetails> {
    return this.http.get<StockDetails>(`${this.endpointFunctions}/getstockdetails?symbol=${symbol}`);
  }

  getStockHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.http
      .get<HistoricalPrice[]>(`${this.endpointFunctions}/getassethistoricalprices?symbol=${symbol}&period=${period}`)
      .pipe(retry(3));
  }

  getStockScreening(screeningValue: StockScreenerValues): Observable<StockSummary[]> {
    return this.http.post<StockSummary[]>(`${this.endpointFunctions}/getstockscreening`, screeningValue);
  }

  getStockEarnings(symbol: string): Observable<StockEarning[]> {
    return this.http.get<StockEarning[]>(`${this.endpointFunctions}/getstockearnings?symbol=${symbol}`);
  }
}
