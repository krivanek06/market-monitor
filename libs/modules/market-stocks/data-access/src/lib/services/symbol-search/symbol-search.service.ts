import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote } from '@mm/api-types';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SymbolSearchService {
  private marketApiService = inject(MarketApiService);
  private searchedSymbols = signal<SymbolQuote[]>([]);

  readonly defaultSymbolsArr = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA'];
  readonly defaultCrypto = [
    'BTCUSD',
    'ETHUSD',
    'LTCUSD',
    'XRPUSD',
    'ADAUSD',
    'DOGEUSD',
    'SOLUSD',
    'ATOMUSD',
    'AVAXUSD',
    'DOTUSD',
  ];

  getSearchedSymbols = computed(() => this.searchedSymbols());
  getDefaultSymbols = toSignal(this.marketApiService.getSymbolQuotes(this.defaultSymbolsArr), { initialValue: [] });
  getDefaultCrypto = toSignal(
    this.marketApiService
      .getSymbolQuotes(this.defaultCrypto)
      .pipe(map((data) => data.sort((a, b) => b.marketCap - a.marketCap))),
    { initialValue: [] },
  );

  addSearchedSymbol(quote: SymbolQuote): void {
    // remove from searchedSymbols$
    const newQuotes = this.getSearchedSymbols().filter((s) => s.symbol !== quote.symbol);

    // save data into array, limit to 12
    this.persistData([quote, ...newQuotes]);
  }

  removeSearchedSymbol(quote: SymbolQuote): void {
    // remove from searchedSymbols$
    const newQuotes = this.getSearchedSymbols().filter((s) => s.symbol !== quote.symbol);

    // remove from storage
    this.persistData(newQuotes);
  }

  /**
   *
   * @param quotes - array of symbol data to persist locally
   */
  private persistData(quotes: SymbolQuote[]): void {
    const symbolQuotesSlice = quotes.slice(0, 20);

    // save into subject
    this.searchedSymbols.set(symbolQuotesSlice);
  }
}
