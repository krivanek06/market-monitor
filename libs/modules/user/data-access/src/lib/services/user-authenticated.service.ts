import { Injectable } from '@angular/core';
import { PortfolioApiService } from '@market-monitor/api-client';
import { User } from '@market-monitor/api-types';
import { LocalStorageService } from '@market-monitor/shared/utils-client';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { mockUser } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserAuthenticatedService extends LocalStorageService<User | null> {
  private authenticatedUser = new BehaviorSubject<User | null>(mockUser);
  constructor(private portfolioApiService: PortfolioApiService) {
    super('USER_AUTHENTICATED', null);
    this.initService();
  }

  get user(): User {
    const user = this.authenticatedUser.getValue();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return user;
  }

  setUser(user: User): void {
    this.authenticatedUser.next(user);
  }

  getUser(): Observable<User> {
    return this.authenticatedUser.asObservable().pipe(filter((u): u is User => !!u));
  }

  // getPortfolioHoldingsData(): Observable<PortfolioHoldingsData[]> {
  //   return this.getUser().pipe(
  //     distinctUntilKeyChanged('holdings'),
  //     switchMap((user) => this.portfolioApiService.getPortfolioHoldingsDataByUser(user.id)),
  //   );
  // }

  // getPortfolioRisk(): Observable<PortfolioRisk | null> {
  //   return this.getUser().pipe(
  //     distinctUntilKeyChanged('holdings'),
  //     switchMap((user) => this.portfolioApiService.getPortfolioRiskByUser(user.id)),
  //   );
  // }

  // getPortfolioGrowth(): Observable<PortfolioGrowth[]> {
  //   return this.getUser().pipe(
  //     distinctUntilKeyChanged('holdings'),
  //     switchMap((user) => this.portfolioApiService.getPortfolioGrowthByUser(user.id)),
  //   );
  // }
}
