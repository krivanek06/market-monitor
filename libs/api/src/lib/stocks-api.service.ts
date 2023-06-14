import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  ENDPOINT_FUNCTION_URL,
  HistoricalPrice,
  StockSummary,
  SymbolHistoricalPeriods,
} from '@market-monitor/shared-types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StocksApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENDPOINT_FUNCTION_URL) private readonly endpointFunctions: string
  ) {}

  getStockSummariesByTicker(ticker: string): Observable<StockSummary[]> {
    return this.http.get<StockSummary[]>(
      `${this.endpointFunctions}/searchstocksbasic?symbol=${ticker}`
    );
  }

  getStockSummaries(symbols: string[]): Observable<StockSummary[]> {
    return this.http.get<StockSummary[]>(
      `${this.endpointFunctions}/getstocksummaries?symbol=${symbols.join(',')}`
    );
  }

  getStockSummary(symbol: string): Observable<StockSummary> {
    return this.http.get<StockSummary>(
      `${this.endpointFunctions}/getstocksummary?symbol=${symbol}`
    );
  }

  getSymbolHistoricalPrices(
    symbol: string,
    period: SymbolHistoricalPeriods
  ): Observable<HistoricalPrice[]> {
    return this.http.get<HistoricalPrice[]>(
      `${this.endpointFunctions}/getstockhistoricalprices?symbol=${symbol}&period=${period}`
    );
  }
}
