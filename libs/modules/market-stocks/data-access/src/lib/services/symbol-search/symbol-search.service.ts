import { Injectable, computed, signal } from '@angular/core';
import { StocksApiService } from '@market-monitor/api-client';
import { SymbolSearch, SymbolSummary } from '@market-monitor/api-types';
import { StorageLocalStoreService } from '@market-monitor/shared/features/general-features';

@Injectable({
  providedIn: 'root',
})
export class SymbolSearchService extends StorageLocalStoreService<SymbolSearch[]> {
  private searchedSymbols = signal<SymbolSummary[]>([]);

  /**
   * default symbols to show when no data is available
   */
  private defaultSymbols = signal<SymbolSummary[]>([]);

  constructor(private stocksApiService: StocksApiService) {
    super('SYMBOL_SEARCH', []);
    this.initService();
  }

  getSearchedSymbols = computed(() => this.searchedSymbols());
  getDefaultSymbols = computed(() => this.defaultSymbols());

  addSearchedSymbol(searchSymbol: SymbolSearch): void {
    const savedData = this.getData();
    const symbols = savedData.map((d) => d.symbol);

    if (symbols.includes(searchSymbol.symbol)) {
      return;
    }

    // load data from api
    this.stocksApiService.getStockSummary(searchSymbol.symbol).subscribe((stockSummary) => {
      // save data into array, limit to 12
      if (stockSummary) {
        this.persistData([searchSymbol, ...savedData], [stockSummary, ...this.getSearchedSymbols()]);
      }
    });
  }

  removeSearchedSymbol(searchSymbol: SymbolSearch): void {
    const savedData = this.getData();

    // remove from searchedSymbols$
    const newSavedData = savedData.filter((s) => s.symbol !== searchSymbol.symbol);
    const newSummaries = this.getSearchedSymbols().filter((s) => s.id !== searchSymbol.symbol);

    // remove from storage
    this.persistData(newSavedData, newSummaries);
  }

  /**
   *
   * @param searchSymbols - array of search symbols to saved into local storage
   * @param symbolSummaries - array of symbol summaries to persist locally
   */
  private persistData(searchSymbols: SymbolSearch[], symbolSummaries: SymbolSummary[]): void {
    const searchSymbolsSlice = searchSymbols.slice(0, 20);
    const symbolSummariesSlice = symbolSummaries.slice(0, 20);

    // save into storage
    this.saveData(searchSymbolsSlice);

    // save into subject
    this.searchedSymbols.set(symbolSummariesSlice);
  }

  /**
   * load necessary data from api
   */
  private initService(): void {
    const data = this.getData();
    const symbols = data.map((d) => d.symbol);

    // load favorite stocks from api and last searched stocks from api
    this.stocksApiService.getStockSummaries(symbols).subscribe((searchedStocks) => {
      this.searchedSymbols.set(searchedStocks);
    });

    const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA'];
    this.stocksApiService.getStockSummaries(defaultSymbols).subscribe((defaultStocks) => {
      this.defaultSymbols.set(defaultStocks);
    });
  }
}
