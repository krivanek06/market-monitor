import { Injectable, computed, signal } from '@angular/core';
import { MarketApiService } from '@mm/api-client';
import { SymbolSearch, SymbolSummary } from '@mm/api-types';
import { StorageLocalStoreService } from '@mm/shared/general-features';

@Injectable({
  providedIn: 'root',
})
export class SymbolFavoriteService extends StorageLocalStoreService<SymbolSearch[]> {
  private favoriteSymbols = signal<SymbolSummary[]>([]);

  constructor(private marketApiService: MarketApiService) {
    super('SYMBOL_FAVORITE', []);
    this.initService();
  }

  getFavoriteSymbols = computed(() => this.favoriteSymbols());

  isSymbolInFavoriteObs(symbol: string): boolean {
    return this.favoriteSymbols()
      .map((values) => values.id)
      .includes(symbol);
  }

  addFavoriteSymbol(searchSymbol: SymbolSearch): void {
    const savedData = this.getData();
    const symbols = savedData.map((d) => d.symbol);

    if (symbols.includes(searchSymbol.symbol)) {
      return;
    }

    // load data from api
    this.marketApiService.getSymbolSummary(searchSymbol.symbol).subscribe((stockSummary) => {
      // save data into array, limit to 12
      if (stockSummary) {
        this.persistData([searchSymbol, ...savedData], [stockSummary, ...this.favoriteSymbols()]);
      }
    });
  }

  removeFavoriteSymbol(searchSymbol: SymbolSearch): void {
    const savedData = this.getData();

    // remove from favoriteSymbols$
    const newSavedData = savedData.filter((s) => s.symbol !== searchSymbol.symbol);
    const newSummaries = this.favoriteSymbols().filter((s) => s.id !== searchSymbol.symbol);

    // remove from storage
    this.persistData(newSavedData, newSummaries);
  }

  private persistData(symbolFavorite: SymbolSearch[], symbolSummaries: SymbolSummary[]): void {
    const symbolFavoriteSlice = symbolFavorite.slice(0, 12);
    const symbolSummariesSlice = symbolSummaries.slice(0, 12);

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
    const symbols = data.map((d) => d.symbol);

    // load favorite stocks from api and last searched stocks from api
    this.marketApiService.getSymbolSummaries(symbols).subscribe((favoriteStocks) => {
      this.favoriteSymbols.set(favoriteStocks);
    });
  }
}
