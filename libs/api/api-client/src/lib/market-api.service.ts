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
import { Observable, catchError, map, of } from 'rxjs';
import { ApiCacheService } from './api-cache.service';
import { API_FUNCTION_URL, API_IS_PRODUCTION, constructCFEndpoint } from './api.model';

@Injectable({
  providedIn: 'root',
})
export class MarketApiService extends ApiCacheService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_FUNCTION_URL) private readonly endpointFunctions: string,
    @Inject(API_IS_PRODUCTION) private readonly isProd: boolean,
  ) {
    super(http);
  }

  getHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.getData<HistoricalPrice[]>(
      constructCFEndpoint(
        this.isProd,
        this.endpointFunctions,
        'getassethistoricalprices',
        `symbol=${symbol}&period=${period}`,
      ),
      this.validity2Min,
    );
  }

  getMarketTopPerformance(): Observable<MarketTopPerformanceOverviewResponse> {
    return this.getData<MarketTopPerformanceOverviewResponse>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getmarkettopperformance'),
      this.validity10Min,
    );
  }

  getNews(newsType: FirebaseNewsTypes, symbol: string = ''): Observable<News[]> {
    return this.getData<News[]>(
      `https://get-news.krivanek1234.workers.dev/?news_types=${newsType}&symbol=${symbol}`,
      this.validity30Min,
    ).pipe(catchError(() => of([])));
  }

  getMarketOverview(): Observable<MarketOverview> {
    return this.getData<MarketOverview>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getmarketoverview'),
      this.validity30Min,
    );
  }

  getMarketOverviewData<T extends MarketOverviewDatabaseKeys>(key: T, subKey: string): Observable<MarketOverviewData> {
    return this.getData<MarketOverviewData>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getmarketoverviewdata', `key=${key}&subKey=${subKey}`),
      this.validity30Min,
    );
  }

  getQuotesByType(quoteType: AvailableQuotes): Observable<SymbolQuote[]> {
    return this.http
      .get<SymbolQuote[]>(
        constructCFEndpoint(this.isProd, this.endpointFunctions, 'getquotesbytype', `type=${quoteType}`),
      )
      .pipe(map((data) => data.filter((quote) => !!quote.price && !!quote.name)));
  }

  getQuotesBySymbols(symbols: string[]): Observable<SymbolQuote[]> {
    const symbolString = symbols.join(',');
    return this.getData<SymbolQuote[]>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getquotesbysymbols', `symbol=${symbolString}`),
      this.validity5Min,
    ).pipe(map((data) => data.filter((quote) => !!quote.price && !!quote.name)));
  }

  getQuoteBySymbol(symbol: string): Observable<SymbolQuote | null> {
    return this.http.get<SymbolQuote>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getquotebysymbol', `symbol=${symbol}`),
    );
  }

  getMarketCalendarDividends(month: string | number, year: string | number): Observable<CalendarDividend[]> {
    return this.getData<CalendarDividend[]>(
      constructCFEndpoint(
        this.isProd,
        this.endpointFunctions,
        'getcalendarstockdividends',
        `month=${month}&year=${year}`,
      ),
      this.validity30Min,
    );
  }

  getMarketCalendarEarnings(month: string | number, year: string | number): Observable<CalendarStockEarning[]> {
    return this.getData<CalendarStockEarning[]>(
      constructCFEndpoint(
        this.isProd,
        this.endpointFunctions,
        'getcalendarstockearnigns',
        `month=${month}&year=${year}`,
      ),
      this.validity30Min,
    );
  }

  getMarketCalendarIPOs(month: string | number, year: string | number): Observable<CalendarStockIPO[]> {
    return this.getData<CalendarStockIPO[]>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getcalendarstockipos', `month=${month}&year=${year}`),
      this.validity30Min,
    );
  }

  getInstitutionalPortfolioDates(): Observable<string[]> {
    return this.getData<string[]>(
      constructCFEndpoint(this.isProd, this.endpointFunctions, 'getinstitutionalportfoliodates'),
      this.validity30Min,
    );
  }
}
