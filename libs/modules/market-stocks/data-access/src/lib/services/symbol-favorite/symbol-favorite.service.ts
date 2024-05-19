import { Injectable, computed, inject, signal } from '@angular/core';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote } from '@mm/api-types';
import { StorageLocalStoreService } from '@mm/shared/general-features';

/**
 * Service to manage (add/remove) favorite symbols into local storage
 * for unauthenticated users
 */
@Injectable({
  providedIn: 'root',
})
export class SymbolFavoriteService extends StorageLocalStoreService<string[]> {
  private marketApiService = inject(MarketApiService);
  private favoriteSymbols = signal<SymbolQuote[]>([]);

  constructor() {
    super('SYMBOL_FAVORITE', [], 1);
    this.initService();
  }

  getFavoriteSymbols = computed(() => this.favoriteSymbols().sort((a, b) => a.symbol.localeCompare(b.symbol)));

  isSymbolInFavorite(symbol: string): boolean {
    return this.favoriteSymbols()
      .map((values) => values.symbol)
      .includes(symbol);
  }

  addFavoriteSymbol(searchSymbol: SymbolQuote): void {
    const savedData = this.getData();

    if (savedData.includes(searchSymbol.symbol)) {
      return;
    }

    // load data from api
    this.persistData([searchSymbol, ...this.favoriteSymbols()]);
  }

  removeFavoriteSymbol(searchSymbol: SymbolQuote): void {
    // remove from favoriteSymbols$
    const newQuotes = this.favoriteSymbols().filter((s) => s.symbol !== searchSymbol.symbol);

    // remove from storage
    this.persistData(newQuotes);
  }

  private persistData(symbolQuotes: SymbolQuote[]): void {
    const symbolFavoriteSlice = symbolQuotes.slice(0, 12).map((d) => d.symbol);
    const symbolSummariesSlice = symbolQuotes.slice(0, 12);

    // save into storage
    this.saveData(symbolFavoriteSlice);

    // save into subject
    this.favoriteSymbols.set(symbolSummariesSlice);
  }

  /**
   * load necessary data from api
   */
  private initService(): void {
    const data = this.getData();

    // load favorite stocks from api and last searched stocks from api
    this.marketApiService.getSymbolQuotes(data).subscribe((favoriteStocks) => {
      this.favoriteSymbols.set(favoriteStocks);
    });
  }
}
