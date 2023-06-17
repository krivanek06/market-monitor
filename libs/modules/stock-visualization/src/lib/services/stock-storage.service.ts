import { Injectable } from '@angular/core';
import { StocksApiService } from '@market-monitor/api';
import { StorageService } from '@market-monitor/services';
import { StockSummary } from '@market-monitor/shared-types';
import { BehaviorSubject, Observable, forkJoin, map } from 'rxjs';
import { StockStorageData } from '../models';

// TODO: if user authenticated - saved these data into firestore
@Injectable({
  providedIn: 'root',
})
export class StockStorageService extends StorageService<StockStorageData> {
  private favoriteStocks$ = new BehaviorSubject<StockSummary[]>([]);
  private lastSearchedStocks$ = new BehaviorSubject<StockSummary[]>([]);
  private loadedData$ = new BehaviorSubject<boolean>(false);

  constructor(private stocksApiService: StocksApiService) {
    super('STORAGE_STOCK_SERVICE', {
      favoriteStocks: [],
      lastSearchedStocks: [],
    });
    this.initService();
  }
  isDataLoaded(): Observable<boolean> {
    return this.loadedData$.asObservable();
  }

  // -----------------------------

  getLastSearchedStocks(): Observable<StockSummary[]> {
    return this.lastSearchedStocks$.asObservable();
  }

  toggleSearchStock(symbol: string): boolean {
    if (this.isSymbolInLastSearched(symbol)) {
      this.removeLastSearchedStock(symbol);
      return false;
    }
    this.addSearchStock(symbol);
    return true;
  }

  addSearchStock(symbol: string): void {
    const savedData = this.getData();

    if (savedData.lastSearchedStocks.includes(symbol)) {
      return;
    }

    // load data from api
    this.stocksApiService.getStockSummary(symbol).subscribe((stockSummary) => {
      // save data into array, limit to 12
      this.lastSearchedStocks$.next([stockSummary, ...this.lastSearchedStocks$.getValue()].slice(0, 12));
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
    this.lastSearchedStocks$.next(this.lastSearchedStocks$.getValue().filter((s) => s.id !== symbol));

    // remove from storage
    this.saveData({
      ...savedData,
      lastSearchedStocks: savedData.lastSearchedStocks.filter((s) => s !== symbol),
    });
  }

  // -----------------------------

  getFavoriteStocks(): Observable<StockSummary[]> {
    return this.favoriteStocks$.asObservable();
  }

  toggleFavoriteSymbol(symbol: string): boolean {
    if (this.isSymbolInFavorite(symbol)) {
      this.removeFavoriteStock(symbol);
      return false;
    }
    this.addFavoriteSymbol(symbol);
    return true;
  }

  addFavoriteSymbol(symbol: string): void {
    const savedData = this.getData();

    if (savedData.favoriteStocks.includes(symbol)) {
      return;
    }

    // load data from api
    this.stocksApiService.getStockSummary(symbol).subscribe((stockSummary) => {
      // save data into array, limit to 12
      this.favoriteStocks$.next([stockSummary, ...this.favoriteStocks$.getValue()].slice(0, 12));
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

  isSymbolInFavoriteObs(symbol: string): Observable<boolean> {
    return this.favoriteStocks$.asObservable().pipe(
      map((values) => values.map((d) => d.id)),
      map((symbols) => symbols.includes(symbol))
    );
  }

  removeFavoriteStock(symbol: string): void {
    const savedData = this.getData();

    // remove from favoriteStocks$
    this.favoriteStocks$.next(this.favoriteStocks$.getValue().filter((s) => s.id !== symbol));

    // remove from storage
    this.saveData({
      ...savedData,
      favoriteStocks: savedData.favoriteStocks.filter((s) => s !== symbol),
    });
  }

  private initService(): void {
    const data = this.getData();

    // load favorite stocks from api and last searched stocks from api
    forkJoin([
      this.stocksApiService.getStockSummaries(data.favoriteStocks),
      this.stocksApiService.getStockSummaries(data.lastSearchedStocks),
    ]).subscribe(([favoriteStocks, lastSearchedStocks]) => {
      this.favoriteStocks$.next(favoriteStocks);
      this.lastSearchedStocks$.next(lastSearchedStocks);
      this.loadedData$.next(true);
    });
  }
}
