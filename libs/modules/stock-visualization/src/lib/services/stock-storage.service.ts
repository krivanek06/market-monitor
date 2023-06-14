import { Injectable } from '@angular/core';
import { StocksApiService } from '@market-monitor/api';
import { StorageService } from '@market-monitor/services';
import { StockSummary } from '@market-monitor/shared-types';
import { BehaviorSubject, Observable } from 'rxjs';
import { StockStorageData } from '../models';

// TODO: if user authenticated - saved these data into firestore
@Injectable({
  providedIn: 'root',
})
export class StockStorageService extends StorageService<StockStorageData> {
  private favoriteStocks$ = new BehaviorSubject<StockSummary[]>([]);
  private lastSearchedStocks$ = new BehaviorSubject<StockSummary[]>([]);

  constructor(private stocksApiService: StocksApiService) {
    super('STORAGE_STOCK_SERVICE', {
      favoriteStocks: [],
      lastSearchedStocks: [],
    });
    this.initService();
  }

  getLastSearchedStocks(): Observable<StockSummary[]> {
    return this.favoriteStocks$.asObservable();
  }

  getFavoriteStocks(): Observable<StockSummary[]> {
    return this.lastSearchedStocks$.asObservable();
  }

  addSearchStock(symbol: string): void {
    const savedData = this.getData();

    if (savedData.lastSearchedStocks.includes(symbol)) {
      return;
    }

    // load data from api
    this.stocksApiService.getStockSummary(symbol).subscribe((stockSummary) => {
      this.lastSearchedStocks$.next([
        ...this.lastSearchedStocks$.getValue(),
        stockSummary,
      ]);
    });

    // save into storage
    this.saveData({
      ...savedData,
      lastSearchedStocks: [...savedData.lastSearchedStocks, symbol],
    });
  }

  isSymbolInLastSearched(symbol: string): boolean {
    return this.getData().lastSearchedStocks.includes(symbol);
  }

  removeLastSearchedStock(symbol: string): void {
    const savedData = this.getData();

    // remove from lastSearchedStocks$
    this.lastSearchedStocks$.next(
      this.lastSearchedStocks$.getValue().filter((s) => s.id !== symbol)
    );

    // remove from storage
    this.saveData({
      ...savedData,
      lastSearchedStocks: savedData.lastSearchedStocks.filter(
        (s) => s !== symbol
      ),
    });
  }

  addFavoriteSymbol(symbol: string): void {
    const savedData = this.getData();

    if (savedData.favoriteStocks.includes(symbol)) {
      return;
    }

    // load data from api
    this.stocksApiService.getStockSummary(symbol).subscribe((stockSummary) => {
      this.favoriteStocks$.next([
        ...this.favoriteStocks$.getValue(),
        stockSummary,
      ]);
    });

    // save into storage
    this.saveData({
      ...savedData,
      favoriteStocks: [...savedData.favoriteStocks, symbol],
    });
  }

  isSymbolInFavorite(symbol: string): boolean {
    return this.getData().favoriteStocks.includes(symbol);
  }

  removeFavoriteStock(symbol: string): void {
    const savedData = this.getData();

    // remove from favoriteStocks$
    this.favoriteStocks$.next(
      this.favoriteStocks$.getValue().filter((s) => s.id !== symbol)
    );

    // remove from storage
    this.saveData({
      ...savedData,
      favoriteStocks: savedData.favoriteStocks.filter((s) => s !== symbol),
    });
  }

  private initService(): void {
    const data = this.getData();

    // load favorite stocks from api
    this.stocksApiService
      .getStockSummaries(data.favoriteStocks)
      .subscribe((stockSummaries) => {
        console.log('stockSummaries', stockSummaries);
        this.favoriteStocks$.next(stockSummaries);
      });

    // load last searched stocks from api
    this.stocksApiService
      .getStockSummaries(data.lastSearchedStocks)
      .subscribe((stockSummaries) => {
        console.log('stockSummaries', stockSummaries);
        this.lastSearchedStocks$.next(stockSummaries);
      });
  }
}
