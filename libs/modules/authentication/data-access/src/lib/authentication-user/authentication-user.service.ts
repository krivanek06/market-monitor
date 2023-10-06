import { Injectable, InjectionToken } from '@angular/core';
import { UserApiService } from '@market-monitor/api-client';
import { UserData, UserPortfolioTransaction, UserWatchlist } from '@market-monitor/api-types';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationAccountService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserService {
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

  getUserData(): Observable<UserData> {
    return this.authenticationAccountService.getUserData();
  }

  getUserPortfolioTransactions(): Observable<UserPortfolioTransaction> {
    return this.userApiService.getUserPortfolioTransactions(this.userData.id);
  }

  getUserPortfolioTransactionPromise(): Promise<UserPortfolioTransaction> {
    return this.userApiService.getUserPortfolioTransactionPromise(this.userData.id);
  }

  getUserWatchlist(): Observable<UserWatchlist> {
    return this.userApiService.getUserWatchlist(this.userData.id);
  }

  updateUserData(userData: Partial<UserData>): void {
    this.userApiService.updateUser(this.userData.id, userData);
  }

  updateUserPortfolioTransactionData(transaction: Partial<UserPortfolioTransaction>): void {
    this.userApiService.updateUserPortfolioTransaction(this.userData.id, transaction);
  }

  updateUserWatchlistData(watchlist: Partial<UserWatchlist>): void {
    this.userApiService.updateUserWatchlist(this.userData.id, watchlist);
  }
}
