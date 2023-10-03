import { Inject, Injectable, Optional } from '@angular/core';
import { StocksApiService } from '@market-monitor/api-client';
import { SymbolSearch, SymbolSummary } from '@market-monitor/api-types';
import {
  AUTHENTICATION_ACCOUNT_TOKEN,
  AuthenticationAccountService,
} from '@market-monitor/modules/authentication/data-access';
import { LocalStorageService } from '@market-monitor/shared/utils-client';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SymbolSearchService extends LocalStorageService<SymbolSearch[]> {
  private searchedSymbols$ = new BehaviorSubject<SymbolSummary[]>([]);

  constructor(
    @Inject(AUTHENTICATION_ACCOUNT_TOKEN)
    @Optional()
    private authenticationAccountService: AuthenticationAccountService,
    private stocksApiService: StocksApiService,
  ) {
    super('SYMBOL_SEARCH', []);
    this.initService();

    console.log('authenticationAccountService is alive', !!this.authenticationAccountService);
  }

  getSearchedSymbols(): Observable<SymbolSummary[]> {
    return this.searchedSymbols$.asObservable();
  }

  isSymbolInSearchedObs(symbol: string): Observable<boolean> {
    return this.searchedSymbols$.asObservable().pipe(
      map((values) => values.map((d) => d.id)),
      map((symbols) => symbols.includes(symbol)),
    );
  }

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
        this.persistData([searchSymbol, ...savedData], [stockSummary, ...this.searchedSymbols$.getValue()]);
      }
    });
  }

  removeSearchedeSymbol(searchSymbol: SymbolSearch): void {
    const savedData = this.getData();

    // remove from searchedSymbols$
    const newSavedData = savedData.filter((s) => s.symbol !== searchSymbol.symbol);
    const newSummaries = this.searchedSymbols$.getValue().filter((s) => s.id !== searchSymbol.symbol);

    // remove from storage
    this.persistData(newSavedData, newSummaries);
  }

  private persistData(searchSymbols: SymbolSearch[], symbolSummaries: SymbolSummary[]): void {
    const searchSymbolsSlice = searchSymbols.slice(0, 12);
    const symbolSummariesSlice = symbolSummaries.slice(0, 12);

    // save into storage
    if (this.isUserInitialized()) {
      this.authenticationAccountService.updateUserData({
        lastSearchedSymbols: searchSymbolsSlice,
      });
    } else {
      this.saveData(searchSymbolsSlice);
    }

    // save into subject
    this.searchedSymbols$.next(symbolSummariesSlice);
  }

  /**
   * load necessary data from api
   */
  private initService(): void {
    const data = this.isUserInitialized()
      ? this.authenticationAccountService.userData.lastSearchedSymbols
      : this.getData();
    const symbols = data.map((d) => d.symbol);

    // load favorite stocks from api and last searched stocks from api
    this.stocksApiService.getStockSummaries(symbols).subscribe((searchedStocks) => {
      this.searchedSymbols$.next(searchedStocks);
    });
  }

  private isUserInitialized(): boolean {
    return !!this.authenticationAccountService?.user;
  }
}
