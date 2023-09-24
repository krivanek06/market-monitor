import { Injectable } from '@angular/core';
import { PortfolioApiService } from '@market-monitor/api-client';
import { PortfolioGrowth, PortfolioHoldingsData, PortfolioRisk, User } from '@market-monitor/api-types';
import { BehaviorSubject, Observable, distinctUntilKeyChanged, filter, switchMap } from 'rxjs';
import { mockUser } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserAuthenticatedService {
  private authenticatedUser = new BehaviorSubject<User | null>(mockUser);
  constructor(private portfolioApiService: PortfolioApiService) {}

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

  getPortfolioHoldingsData(): Observable<PortfolioHoldingsData[]> {
    return this.getUser().pipe(
      distinctUntilKeyChanged('holdings'),
      switchMap((user) => this.portfolioApiService.getPortfolioHoldingsDataByUser(user.id)),
    );
  }

  getPortfolioRisk(): Observable<PortfolioRisk | null> {
    return this.getUser().pipe(
      distinctUntilKeyChanged('holdings'),
      switchMap((user) => this.portfolioApiService.getPortfolioRiskByUser(user.id)),
    );
  }

  getPortfolioGrowth(): Observable<PortfolioGrowth[]> {
    return this.getUser().pipe(
      distinctUntilKeyChanged('holdings'),
      switchMap((user) => this.portfolioApiService.getPortfolioGrowthByUser(user.id)),
    );
  }
}
