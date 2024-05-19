import { Injectable, computed, signal } from '@angular/core';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote, SymbolStoreBase } from '@mm/api-types';
import { StorageLocalStoreService } from '@mm/shared/general-features';

@Injectable({
  providedIn: 'root',
})
export class SymbolSearchService extends StorageLocalStoreService<string[]> {
  private searchedSymbols = signal<SymbolQuote[]>([]);

  /**
   * default symbols to show when no data is available
   */
  private defaultSymbols = signal<SymbolQuote[]>([]);

  constructor(private marketApiService: MarketApiService) {
    super('SYMBOL_SEARCH', [], 1);
    this.initService();
  }

  getSearchedSymbols = computed(() => this.searchedSymbols());
  getDefaultSymbols = computed(() => this.defaultSymbols());

  addSearchedSymbol(quote: SymbolQuote): void {
    const savedData = this.getData();

    if (savedData.includes(quote.symbol)) {
      return;
    }

    // save data into array, limit to 12
    this.persistData([quote, ...this.getSearchedSymbols()]);
  }

  removeSearchedSymbol(searchSymbol: SymbolStoreBase): void {
    // remove from searchedSymbols$
    const newQuotes = this.getSearchedSymbols().filter((s) => s.symbol !== searchSymbol.symbol);

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
    this.saveData(searchSymbolsSlice);

    // save into subject
    this.searchedSymbols.set(symbolQuotesSlice);
  }

  /**
   * load necessary data from api
   */
  private initService(): void {
    const data = this.getData();

    // load favorite stocks from api and last searched stocks from api
    this.marketApiService.getSymbolQuotes(data).subscribe((loadedQuotes) => {
      this.searchedSymbols.set(loadedQuotes);
    });

    const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA'];
    this.marketApiService.getSymbolQuotes(defaultSymbols).subscribe((loadedQuotes) => {
      this.defaultSymbols.set(loadedQuotes);
    });
  }
}
