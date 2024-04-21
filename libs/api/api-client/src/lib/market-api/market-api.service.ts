import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AvailableQuotes,
  CalendarDividend,
  CalendarStockEarning,
  CalendarStockIPO,
  ChartDataType,
  HistoricalPrice,
  IsStockMarketOpenExtend,
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
} from '@mm/api-types';
import { chunk } from '@mm/shared/general-util';
import { isBefore } from 'date-fns';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ApiCacheService } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class MarketApiService {
  private apiCache = inject(ApiCacheService);
  getIsMarketOpenSignal = toSignal(this.getIsMarketOpen());

  getSymbolSummaries(symbols: string[] | undefined): Observable<SymbolSummary[]> {
    if (!symbols || symbols.length === 0) {
      return of([]);
    }

    // if more than 100 symbols, split into chunks
    if (symbols.length > 120) {
      return this.getSymbolSummariesLong(symbols);
    }

    return this.apiCache
      .getData<
        SymbolSummary[]
      >(`https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${symbols.join(',')}`, ApiCacheService.validity3Min)
      .pipe(catchError(() => []));
  }

  getSymbolSummary(symbol: string): Observable<SymbolSummary | null> {
    return this.getSymbolSummaries([symbol]).pipe(map((d) => d[0] ?? null));
  }

  getHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.apiCache.getData<HistoricalPrice[]>(
      `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&period=${period}&type=period`,
      ApiCacheService.validity2Min,
    );
  }

  getHistoricalPricesOnDate(symbol: string, date: string): Observable<HistoricalPrice | null> {
    return this.apiCache
      .getData<HistoricalPrice | null>(
        `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&date=${date}&type=specificDate`,
        ApiCacheService.validity2Min,
      )
      .pipe(map((d) => d));
  }

  getHistoricalPricesDateRange(symbol: string, dateStart: string, endDate: string): Observable<HistoricalPrice[]> {
    if (isBefore(endDate, dateStart)) {
      return of([]);
    }
    return this.apiCache.getData<HistoricalPrice[]>(
      `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&dateStart=${dateStart}&dateEnd=${endDate}&type=dateRange`,
      ApiCacheService.validity2Min,
    );
  }

  getMarketTopPerformance(): Observable<MarketTopPerformanceOverviewResponse> {
    return this.apiCache
      .getData<MarketTopPerformanceSymbols>(
        `https://get-basic-data.krivanek1234.workers.dev/?type=top-symbols`,
        ApiCacheService.validity10Min,
      )
      .pipe(
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
            catchError((e) => {
              console.log(e);
              return of({
                stockTopGainers: [],
                stockTopLosers: [],
                stockTopActive: [],
              });
            }),
          ),
        ),
      );
  }

  getNews(newsType: NewsTypes, symbol: string = ''): Observable<News[]> {
    return this.apiCache
      .getData<
        News[]
      >(`https://get-news.krivanek1234.workers.dev/?news_types=${newsType}&symbol=${symbol}`, ApiCacheService.validity30Min)
      .pipe(catchError(() => of([])));
  }

  getMarketOverview(): Observable<MarketOverview> {
    return this.apiCache.getData<MarketOverview>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=market-overview`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketOverviewData<T extends MarketOverviewKey>(
    key: T,
    subKey: MarketOverviewSubkeyReadable<T>,
  ): Observable<ChartDataType> {
    return this.apiCache.getData<ChartDataType>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=market-overview-data&key=${key}&subKey=${subKey}`,
      ApiCacheService.validity30Min,
    );
  }

  getQuotesByType(quoteType: AvailableQuotes): Observable<SymbolQuote[]> {
    return this.apiCache
      .getData<
        SymbolQuote[]
      >(`https://get-basic-data.krivanek1234.workers.dev/?type=quote-by-type&quoteType=${quoteType}`, ApiCacheService.validity10Min)
      .pipe(map((data) => data.filter((quote) => !!quote.price && !!quote.name)));
  }

  getIsMarketOpen(): Observable<IsStockMarketOpenExtend> {
    return this.apiCache.getData<IsStockMarketOpenExtend>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=market-is-open`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketCalendarDividends(month: string | number, year: string | number): Observable<CalendarDividend[]> {
    return this.apiCache.getData<CalendarDividend[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=calendar&calendarType=dividends&month=${month}&year=${year}`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketCalendarEarnings(month: string | number, year: string | number): Observable<CalendarStockEarning[]> {
    return this.apiCache.getData<CalendarStockEarning[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=calendar&calendarType=earnings&month=${month}&year=${year}`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketCalendarIPOs(month: string | number, year: string | number): Observable<CalendarStockIPO[]> {
    return this.apiCache.getData<CalendarStockIPO[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=calendar&calendarType=ipo&month=${month}&year=${year}`,
      ApiCacheService.validity30Min,
    );
  }

  getInstitutionalPortfolioDates(): Observable<string[]> {
    return this.apiCache.getData<string[]>(
      `https://get-basic-data.krivanek1234.workers.dev/?type=institutional-portfolio-dates`,
      ApiCacheService.validity30Min,
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
