import { Injectable, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote } from '@mm/api-types';
import { StorageLocalStoreService } from '@mm/shared/general-features';

@Injectable({
  providedIn: 'root',
})
export class SymbolSearchService extends StorageLocalStoreService<string[]> {
  private searchedSymbols = signal<SymbolQuote[]>([]);

  readonly defaultSymbolsArr = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA'];
  readonly defaultCrypto = ['BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD', 'ADAUSD', 'DOGEUSD', 'SOLUSD', 'ATOMUSD'];

  constructor(private marketApiService: MarketApiService) {
    super('SYMBOL_SEARCH', [], 1);
    this.initService();
  }

  getSearchedSymbols = computed(() => this.searchedSymbols());
  getDefaultSymbols = toSignal(this.marketApiService.getSymbolQuotes(this.defaultSymbolsArr), { initialValue: [] });
  getDefaultCrypto = toSignal(this.marketApiService.getSymbolQuotes(this.defaultCrypto), { initialValue: [] });

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
    const searchSymbolsSlice = quotes.map((d) => d.symbol).slice(0, 20);
    const symbolQuotesSlice = quotes.slice(0, 20);

    // save into storage
    this.updateDataStorage(searchSymbolsSlice);

    // save into subject
    this.searchedSymbols.set(symbolQuotesSlice);
  }

  /**
   * load necessary data from api
   */
  private initService(): void {
    const data = this.getDataStorage();

    // load favorite stocks from api and last searched stocks from api
    this.marketApiService.getSymbolQuotes(data).subscribe((loadedQuotes) => {
      this.searchedSymbols.set(loadedQuotes);
    });
  }
}
