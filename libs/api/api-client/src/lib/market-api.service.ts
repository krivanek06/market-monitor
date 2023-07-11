import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  AvailableQuotes,
  CalendarStockEarning,
  CalendarStockIPO,
  FirebaseNewsTypes,
  HistoricalPrice,
  MarketOverview,
  MarketOverviewData,
  MarketOverviewDatabaseKeys,
  MarketTopPerformanceOverviewResponse,
  News,
  StockDividend,
  SymbolHistoricalPeriods,
  SymbolQuote,
} from '@market-monitor/api-types';
import { Observable, map, retry } from 'rxjs';
import { ENDPOINT_FUNCTION_URL } from './api-url.token';

@Injectable({
  providedIn: 'root',
})
export class MarketApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENDPOINT_FUNCTION_URL) private readonly endpointFunctions: string
  ) {}

  getHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.http
      .get<HistoricalPrice[]>(`${this.endpointFunctions}/getassethistoricalprices?symbol=${symbol}&period=${period}`)
      .pipe(retry(3));
  }

  getMarketTopPerformance(): Observable<MarketTopPerformanceOverviewResponse> {
    return this.http.get<MarketTopPerformanceOverviewResponse>(`${this.endpointFunctions}/getmarkettopperformance`);
  }

  getNews(newsType: FirebaseNewsTypes, symbol: string = ''): Observable<News[]> {
    return this.http.get<News[]>(`${this.endpointFunctions}/getmarketnews?news_types=${newsType}&symbol=${symbol}`);
  }

  getMarketOverview(): Observable<MarketOverview> {
    return this.http.get<MarketOverview>(`${this.endpointFunctions}/getmarketoverview`);
  }

  getMarketOverviewData<T extends MarketOverviewDatabaseKeys>(key: T, subKey: string): Observable<MarketOverviewData> {
    return this.http.get<MarketOverviewData>(
      `${this.endpointFunctions}/getmarketoverviewdata?key=${key}&subKey=${subKey}`
    );
  }

  getQuotesByType(quoteType: AvailableQuotes): Observable<SymbolQuote[]> {
    return this.http
      .get<SymbolQuote[]>(`${this.endpointFunctions}/getquotesbytype?type=${quoteType}`)
      .pipe(map((data) => data.filter((quote) => !!quote.price && !!quote.name)));
  }

  getQuotesBySymbols(symbols: string[]): Observable<SymbolQuote[]> {
    const symbolString = symbols.join(',');
    return this.http
      .get<SymbolQuote[]>(`${this.endpointFunctions}/getquotesbysymbols?symbol=${symbolString}`)
      .pipe(map((data) => data.filter((quote) => !!quote.price && !!quote.name)));
  }

  getQuoteBySymbol(symbol: string): Observable<SymbolQuote | null> {
    return this.http.get<SymbolQuote>(`${this.endpointFunctions}/getquotebysymbol?symbol=${symbol}`);
  }

  getMarketCalendarDividends(month: string | number, year: string | number): Observable<StockDividend[]> {
    return this.http.get<StockDividend[]>(
      `${this.endpointFunctions}/getcalendarstockdividends?month=${month}&year=${year}`
    );
  }

  getMarketCalendarEarnings(month: string | number, year: string | number): Observable<CalendarStockEarning[]> {
    return this.http.get<CalendarStockEarning[]>(
      `${this.endpointFunctions}/getcalendarstockearnigns?month=${month}&year=${year}`
    );
  }

  getMarketCalendarIPOs(month: string | number, year: string | number): Observable<CalendarStockIPO[]> {
    return this.http.get<CalendarStockIPO[]>(
      `${this.endpointFunctions}/getcalendarstockipos?month=${month}&year=${year}`
    );
  }
}
