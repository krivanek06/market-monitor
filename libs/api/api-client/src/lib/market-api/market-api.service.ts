import { Injectable } from '@angular/core';
import {
  AvailableQuotes,
  CalendarDividend,
  CalendarStockEarning,
  CalendarStockIPO,
  ChartDataType,
  HistoricalPrice,
  MarketOverview,
  MarketOverviewKey,
  MarketOverviewSubkeyReadable,
  MarketTopPerformanceOverviewResponse,
  MarketTopPerformanceSymbols,
  News,
  NewsTypes,
  SymbolHistoricalPeriods,
  SymbolQuote,
  SymbolSummary,
} from '@market-monitor/api-types';
import { chunk } from '@market-monitor/shared/features/general-util';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ApiCacheService } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class MarketApiService extends ApiCacheService {
  constructor() {
    super();
  }

  getSymbolSummaries(symbols: string[] | undefined): Observable<SymbolSummary[]> {
    if (!symbols || symbols.length === 0) {
      return of([]);
    }

    // if more than 100 symbols, split into chunks
    if (symbols.length > 120) {
      return this.getSymbolSummariesLong(symbols);
    }

    return this.getData<SymbolSummary[]>(
      `https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${symbols.join(',')}`,
      this.validity3Min,
    ).pipe(catchError(() => []));
  }

  getSymbolSummary(symbol: string): Observable<SymbolSummary | null> {
    return this.getSymbolSummaries([symbol]).pipe(map((d) => d[0] ?? null));
  }

  getHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.getData<HistoricalPrice[]>(
      `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&period=${period}&type=period`,
      this.validity2Min,
    );
  }

  getHistoricalPricesOnDate(symbol: string, date: string): Observable<HistoricalPrice | null> {
    return this.getData<HistoricalPrice | null>(
      `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&date=${date}&type=specificDate`,
      this.validity2Min,
    ).pipe(map((d) => d));
  }

  getHistoricalPricesDateRange(symbol: string, dateStart: string, endDate: string): Observable<HistoricalPrice[]> {
    return this.getData<HistoricalPrice[]>(
      `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&dateStart=${dateStart}&dateEnd=${endDate}&type=dateRange`,
      this.validity2Min,
    );
  }

  getMarketTopPerformance(): Observable<MarketTopPerformanceOverviewResponse> {
    return this.getData<MarketTopPerformanceSymbols>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=top-symbols`,
      this.validity10Min,
    ).pipe(
      switchMap((topSymbols) =>
        forkJoin([
          this.getSymbolSummaries(topSymbols.stockTopGainers),
          this.getSymbolSummaries(topSymbols.stockTopLosers),
          this.getSymbolSummaries(topSymbols.stockTopActive),
        ]).pipe(
          map(([gainers, losers, actives]) => ({
            stockTopGainers: gainers,
            stockTopLosers: losers,
            stockTopActive: actives,
          })),
        ),
      ),
    );
  }

  getNews(newsType: NewsTypes, symbol: string = ''): Observable<News[]> {
    return this.getData<News[]>(
      `https://get-news.krivanek1234.workers.dev/?news_types=${newsType}&symbol=${symbol}`,
      this.validity30Min,
    ).pipe(catchError(() => of([])));
  }

  getMarketOverview(): Observable<MarketOverview> {
    return this.getData<MarketOverview>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=market-overview`,
      this.validity30Min,
    );
  }

  getMarketOverviewData<T extends MarketOverviewKey>(
    key: T,
    subKey: MarketOverviewSubkeyReadable<T>,
  ): Observable<ChartDataType> {
    return this.getData<ChartDataType>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=market-overview-data&key=${key}&subKey=${subKey}`,
      this.validity30Min,
    );
  }

  getQuotesByType(quoteType: AvailableQuotes): Observable<SymbolQuote[]> {
    return this.getData<SymbolQuote[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=quote-by-type&quoteType=${quoteType}`,
      this.validity10Min,
    ).pipe(map((data) => data.filter((quote) => !!quote.price && !!quote.name)));
  }

  getMarketCalendarDividends(month: string | number, year: string | number): Observable<CalendarDividend[]> {
    return this.getData<CalendarDividend[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=calendar&calendarType=dividends&month=${month}&year=${year}`,
      this.validity30Min,
    );
  }

  getMarketCalendarEarnings(month: string | number, year: string | number): Observable<CalendarStockEarning[]> {
    return this.getData<CalendarStockEarning[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=calendar&calendarType=earnings&month=${month}&year=${year}`,
      this.validity30Min,
    );
  }

  getMarketCalendarIPOs(month: string | number, year: string | number): Observable<CalendarStockIPO[]> {
    return this.getData<CalendarStockIPO[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=calendar&calendarType=ipo&month=${month}&year=${year}`,
      this.validity30Min,
    );
  }

  getInstitutionalPortfolioDates(): Observable<string[]> {
    return this.getData<string[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=institutional-portfolio-dates`,
      this.validity30Min,
    );
  }

  private getSymbolSummariesLong(symbols: string[]): Observable<SymbolSummary[]> {
    const chunkLimit = 100;
    const checkedSymbols = chunk(symbols, chunkLimit);
    return forkJoin(checkedSymbols.map((chunk) => this.getSymbolSummaries(chunk))).pipe(
      map((data) => data.reduce((acc, curr) => [...acc, ...curr], [])),
    );
  }
}
