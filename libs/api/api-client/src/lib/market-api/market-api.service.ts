import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AvailableQuotes,
  CalendarDividend,
  CalendarStockEarning,
  CalendarStockIPO,
  DataDateValueArray,
  FinancialEconomicTypes,
  HistoricalPrice,
  IsStockMarketOpenExtend,
  MarketTopPerformanceOverviewResponse,
  MarketTopPerformanceSymbols,
  News,
  NewsTypes,
  StockScreenerResults,
  StockScreenerValues,
  SymbolHistoricalPeriods,
  SymbolQuote,
  SymbolSummary,
  TreasureDataBySections,
} from '@mm/api-types';
import { chunk } from '@mm/shared/general-util';
import { isBefore } from 'date-fns';
import { Observable, catchError, forkJoin, map, mergeMap, of, reduce, switchMap } from 'rxjs';
import { ApiCacheService } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class MarketApiService {
  private readonly cloudflareBasicAPI = 'https://get-basic-data.krivanek1234.workers.dev';
  private readonly cloudflareHistoricalPriceAPI = 'https://get-historical-prices.krivanek1234.workers.dev';
  private readonly cloudflareSymbolSummaryAPI = 'https://get-symbol-summary.krivanek1234.workers.dev';

  private readonly apiCache = inject(ApiCacheService);
  readonly getIsMarketOpenSignal = toSignal(this.getIsMarketOpen());

  getSymbolQuotes(symbols: string[] | undefined): Observable<SymbolQuote[]> {
    if (!symbols || symbols.length === 0) {
      return of([]);
    }

    return this.apiCache
      .getData<
        SymbolQuote[]
      >(`${this.cloudflareSymbolSummaryAPI}/?symbol=${symbols.join(',')}&onlyQuote=true`, ApiCacheService.validity3Min)
      .pipe(catchError(() => []));
  }

  searchQuotesByPrefix(ticker: string, isCrypto = false): Observable<SymbolQuote[]> {
    if (!ticker) {
      return of([]);
    }
    return this.apiCache
      .getData<
        SymbolQuote[]
      >(`${this.cloudflareSymbolSummaryAPI}/?symbol=${ticker}&isCrypto=${isCrypto}&isSearch=true&onlyQuote=true`, ApiCacheService.validity5Min)
      .pipe(catchError(() => []));
  }

  getSymbolSummaries(symbols: string[] | undefined): Observable<SymbolSummary[]> {
    if (!symbols || symbols.length === 0) {
      return of([]);
    }

    // if more than 100 symbols, split into chunks
    if (symbols.length > 50) {
      return this.getSymbolSummariesLong(symbols);
    }

    return this.apiCache
      .getData<
        SymbolSummary[]
      >(`${this.cloudflareSymbolSummaryAPI}/?symbol=${symbols.join(',')}`, ApiCacheService.validity3Min)
      .pipe(catchError(() => []));
  }

  getSymbolSummary(symbol: string): Observable<SymbolSummary> {
    return this.getSymbolSummaries([symbol]).pipe(
      map((d) => {
        if (d.length === 0) {
          throw new Error('Symbol not found');
        }
        return d[0];
      }),
    );
  }

  getHistoricalPrices(symbol: string, period: SymbolHistoricalPeriods): Observable<HistoricalPrice[]> {
    return this.apiCache.getData<HistoricalPrice[]>(
      `${this.cloudflareHistoricalPriceAPI}?symbol=${symbol}&period=${period}&type=period`,
      ApiCacheService.validity2Min,
    );
  }

  getHistoricalPricesOnDate(symbol: string, date: string): Observable<HistoricalPrice | null> {
    return this.apiCache
      .getData<HistoricalPrice | null>(
        `${this.cloudflareHistoricalPriceAPI}?symbol=${symbol}&date=${date}&type=specificDate`,
        ApiCacheService.validity2Min,
      )
      .pipe(map((d) => d));
  }

  getHistoricalPricesDateRange(symbol: string, dateStart: string, endDate: string): Observable<HistoricalPrice[]> {
    if (isBefore(endDate, dateStart)) {
      return of([]);
    }

    return this.apiCache.getData<HistoricalPrice[]>(
      `${this.cloudflareHistoricalPriceAPI}?symbol=${symbol}&dateStart=${dateStart}&dateEnd=${endDate}&type=dateRange`,
      ApiCacheService.validity1Hour,
    );
  }

  getMarketTopPerformance(): Observable<MarketTopPerformanceOverviewResponse> {
    return this.apiCache
      .getData<MarketTopPerformanceSymbols>(
        `${this.cloudflareBasicAPI}/?type=top-symbols`,
        ApiCacheService.validity10Min,
      )
      .pipe(
        switchMap((topSymbols) =>
          forkJoin([
            this.getSymbolQuotes(topSymbols.stockTopGainers),
            this.getSymbolQuotes(topSymbols.stockTopLosers),
            this.getSymbolQuotes(topSymbols.stockTopActive),
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

  getStockScreening(screeningValue: StockScreenerValues): Observable<SymbolQuote[]> {
    return this.apiCache
      .postData<
        StockScreenerResults[],
        StockScreenerValues
      >('https://get-stock-screening.krivanek1234.workers.dev', screeningValue, ApiCacheService.validity5Min)
      .pipe(
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
          forkJoin(symbolsChunks.map((chunk) => this.getSymbolQuotes(chunk).pipe(catchError(() => [])))),
        ),
        // flatten
        mergeMap((d) => d),
        // sort by ID
        map((d) => d.slice().sort((a, b) => a.symbol.localeCompare(b.symbol))),
        // Combine all summaries into a single array and emit only once
        reduce((acc, curr) => [...acc, ...curr], [] as SymbolQuote[]),
      );
  }

  getNews(newsType: NewsTypes, symbol = ''): Observable<News[]> {
    return this.apiCache
      .getData<
        News[]
      >(`${this.cloudflareBasicAPI}/?type=news&news_types=${newsType}&symbol=${symbol}`, ApiCacheService.validity30Min)
      .pipe(
        // remove news which has the same title
        map((news) => news.filter((v, i, a) => a.findIndex((t) => t.title === v.title) === i)),
        catchError(() => of([])),
      );
  }

  getQuotesByType(quoteType: AvailableQuotes): Observable<SymbolQuote[]> {
    return this.apiCache
      .getData<
        SymbolQuote[]
      >(`${this.cloudflareBasicAPI}/?type=quote-by-type&quoteType=${quoteType}`, ApiCacheService.validity10Min)
      .pipe(map((data) => data.filter((quote) => !!quote.price && !!quote.name)));
  }

  getIsMarketOpen(): Observable<IsStockMarketOpenExtend> {
    return this.apiCache
      .getData<IsStockMarketOpenExtend>(`${this.cloudflareBasicAPI}/?type=market-is-open`, ApiCacheService.validity5Min)
      .pipe(
        catchError((e) => {
          console.log(e);
          return of({
            allHolidays: [],
            currentHoliday: [],
            isTheCryptoMarketOpen: true,
            isTheStockMarketOpen: false,
            isTheEuronextMarketOpen: false,
            isTheForexMarketOpen: false,
            stockExchangeName: '',
            stockMarketHolidays: [],
            stockMarketHours: {
              closingHour: 'CLOSED',
              openingHour: 'CLOSED',
            },
          } satisfies IsStockMarketOpenExtend);
        }),
      );
  }

  getMarketCalendarDividends(month: string | number, year: string | number): Observable<CalendarDividend[]> {
    return this.apiCache.getData<CalendarDividend[]>(
      `${this.cloudflareBasicAPI}/?type=calendar&calendarType=dividends&month=${month}&year=${year}`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketCalendarEarnings(month: string | number, year: string | number): Observable<CalendarStockEarning[]> {
    return this.apiCache.getData<CalendarStockEarning[]>(
      `${this.cloudflareBasicAPI}/?type=calendar&calendarType=earnings&month=${month}&year=${year}`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketCalendarIPOs(month: string | number, year: string | number): Observable<CalendarStockIPO[]> {
    return this.apiCache.getData<CalendarStockIPO[]>(
      `${this.cloudflareBasicAPI}/?type=calendar&calendarType=ipo&month=${month}&year=${year}`,
      ApiCacheService.validity30Min,
    );
  }

  getInstitutionalPortfolioDates(): Observable<string[]> {
    return this.apiCache.getData<string[]>(
      `${this.cloudflareBasicAPI}/?type=institutional-portfolio-dates`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketTreasuryData(): Observable<TreasureDataBySections> {
    return this.apiCache.getData<TreasureDataBySections>(
      `${this.cloudflareBasicAPI}/?type=market-treasury`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketEconomicDataAll(): Observable<{ [K in FinancialEconomicTypes]: DataDateValueArray }> {
    return this.apiCache.getData<{ [K in FinancialEconomicTypes]: DataDateValueArray }>(
      `${this.cloudflareBasicAPI}/?type=market-economics`,
      ApiCacheService.validity30Min,
    );
  }

  getMarketEconomicData(economicType: FinancialEconomicTypes): Observable<DataDateValueArray> {
    return this.apiCache
      .getData<{
        [K in FinancialEconomicTypes]: DataDateValueArray;
      }>(
        `${this.cloudflareBasicAPI}/?type=market-economics&economicType=${economicType}`,
        ApiCacheService.validity30Min,
      )
      .pipe(map((d) => d[economicType]));
  }

  isMarketOpenForQuote(type: 'stock' | 'crypto' = 'stock'): boolean {
    const marketOpen = this.getIsMarketOpenSignal();
    if (type === 'crypto') {
      return marketOpen?.isTheCryptoMarketOpen ?? false;
    }

    return marketOpen?.isTheStockMarketOpen ?? false;
  }

  private getSymbolSummariesLong(symbols: string[]): Observable<SymbolSummary[]> {
    const chunkLimit = 50;
    const checkedSymbols = chunk(symbols, chunkLimit);
    return forkJoin(checkedSymbols.map((chunk) => this.getSymbolSummaries(chunk))).pipe(
      map((data) => data.reduce((acc, curr) => [...acc, ...curr], [])),
    );
  }
}
