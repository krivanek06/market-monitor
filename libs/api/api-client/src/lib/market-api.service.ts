import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  AvailableQuotes,
  CalendarDividend,
  CalendarStockEarning,
  CalendarStockIPO,
  FirebaseNewsTypes,
  HistoricalPrice,
  MarketOverview,
  MarketOverviewData,
  MarketOverviewDatabaseKeys,
  MarketTopPerformanceOverviewResponse,
  News,
  SymbolHistoricalPeriods,
  SymbolQuote,
} from '@market-monitor/api-types';
import { Observable, map } from 'rxjs';
import { ApiCacheService } from './api-cache.service';
import { ENDPOINT_FUNCTION_URL } from './api-url.token';

@Injectable({
  providedIn: 'root',
})
export class MarketApiService extends ApiCacheService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENDPOINT_FUNCTION_URL) private readonly endpointFunctions: string,
  ) {
    super(http);
  }

  getHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.getData<HistoricalPrice[]>(
      `${this.endpointFunctions}/getassethistoricalprices?symbol=${symbol}&period=${period}`,
      this.validity2Min,
    );
  }

  getMarketTopPerformance(): Observable<MarketTopPerformanceOverviewResponse> {
    return this.getData<MarketTopPerformanceOverviewResponse>(
      `${this.endpointFunctions}/getmarkettopperformance`,
      this.validity10Min,
    );
  }

  getNews(newsType: FirebaseNewsTypes, symbol: string = ''): Observable<News[]> {
    return this.getData<News[]>(
      `${this.endpointFunctions}/getmarketnews?news_types=${newsType}&symbol=${symbol}`,
      this.validity30Min,
    );
  }

  getMarketOverview(): Observable<MarketOverview> {
    return this.getData<MarketOverview>(`${this.endpointFunctions}/getmarketoverview`, this.validity30Min);
  }

  getMarketOverviewData<T extends MarketOverviewDatabaseKeys>(key: T, subKey: string): Observable<MarketOverviewData> {
    return this.getData<MarketOverviewData>(
      `${this.endpointFunctions}/getmarketoverviewdata?key=${key}&subKey=${subKey}`,
      this.validity30Min,
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

  getMarketCalendarDividends(month: string | number, year: string | number): Observable<CalendarDividend[]> {
    return this.getData<CalendarDividend[]>(
      `${this.endpointFunctions}/getcalendarstockdividends?month=${month}&year=${year}`,
      this.validity30Min,
    );
  }

  getMarketCalendarEarnings(month: string | number, year: string | number): Observable<CalendarStockEarning[]> {
    return this.getData<CalendarStockEarning[]>(
      `${this.endpointFunctions}/getcalendarstockearnigns?month=${month}&year=${year}`,
      this.validity30Min,
    );
  }

  getMarketCalendarIPOs(month: string | number, year: string | number): Observable<CalendarStockIPO[]> {
    return this.getData<CalendarStockIPO[]>(
      `${this.endpointFunctions}/getcalendarstockipos?month=${month}&year=${year}`,
      this.validity30Min,
    );
  }

  getInstitutionalPortfolioDates(): Observable<string[]> {
    return this.getData<string[]>(`${this.endpointFunctions}/getinstitutionalportfoliodates`, this.validity30Min);
  }
}
