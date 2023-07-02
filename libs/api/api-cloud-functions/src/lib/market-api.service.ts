import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  AvailableQuotes,
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
}
