import { Injectable, InjectionToken } from '@angular/core';
import { UserApiService } from '@market-monitor/api-client';
import {
  SymbolType,
  USER_ROLE,
  UserData,
  UserPortfolioTransaction,
  UserSettings,
  UserWatchlist,
} from '@market-monitor/api-types';
import { User } from 'firebase/auth';
import { Observable, firstValueFrom, map, shareReplay, tap } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationAccountService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserService {
  /**
   * prevent multiple calls to the api
   */
  private userPortfolioTransaction$ = this.userApiService.getUserPortfolioTransactions(this.userData.id).pipe(
    tap(() => console.log(`AuthenticationUserService: getUserPortfolioTransactions`)),
    shareReplay(1),
  );

  private userWatchlist$ = this.userApiService.getUserWatchlist(this.userData.id).pipe(
    tap(() => console.log(`AuthenticationUserService: getUserWatchlist`)),
    shareReplay(1),
  );

  constructor(
    private authenticationAccountService: AuthenticationAccountService,
    private userApiService: UserApiService,
  ) {}

  get user(): User {
    return this.authenticationAccountService.user;
  }

  get userData(): UserData {
    return this.authenticationAccountService.userData;
  }

  get userSettings(): UserSettings {
    return this.userData.settings;
  }

  get isUserRoleAdmin(): boolean {
    return this.userData.role === USER_ROLE.ADMIN;
  }

  get isUserRoleBasic(): boolean {
    return this.userData.role === USER_ROLE.BASIC;
  }

  get isUserRoleSimulation(): boolean {
    return this.userData.role === USER_ROLE.SIMULATION;
  }

  getUserData(): Observable<UserData> {
    return this.authenticationAccountService.getUserData();
  }

  getIsUserNew(): Observable<boolean> {
    return this.getUserData().pipe(map((d) => d.accountResets.length === 0));
  }

  getUserPortfolioTransactions(): Observable<UserPortfolioTransaction> {
    return this.userPortfolioTransaction$;
  }

  getUserPortfolioTransactionPromise(): Promise<UserPortfolioTransaction> {
    return firstValueFrom(this.userPortfolioTransaction$);
  }

  getUserWatchlist(): Observable<UserWatchlist> {
    return this.userWatchlist$;
  }

  updateUserData(userData: Partial<UserData>): void {
    this.userApiService.updateUser(this.userData.id, userData);
  }

  updateUserPortfolioTransactionData(transaction: Partial<UserPortfolioTransaction>): void {
    this.userApiService.updateUserPortfolioTransaction(this.userData.id, transaction);
  }

  addSymbolToUserWatchlist(symbol: string, symbolType: SymbolType): void {
    this.userApiService.addSymbolToUserWatchlist(this.userData.id, symbol, symbolType);
  }

  removeSymbolFromUserWatchlist(symbol: string, symbolType: SymbolType): void {
    this.userApiService.removeSymbolFromUserWatchlist(this.userData.id, symbol, symbolType);
  }

  isSymbolInWatchlist(symbol: string): Observable<boolean> {
    return this.userWatchlist$.pipe(map((watchlist) => !!watchlist.data.find((d) => d.symbol === symbol)));
  }
}
