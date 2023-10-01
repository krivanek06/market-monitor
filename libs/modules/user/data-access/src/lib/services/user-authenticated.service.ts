import { Injectable } from '@angular/core';
import { PortfolioApiService } from '@market-monitor/api-client';
import { UserData } from '@market-monitor/api-types';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { mockUser } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserAuthenticatedService {
  private authenticatedUser = new BehaviorSubject<UserData | null>(mockUser);
  constructor(private portfolioApiService: PortfolioApiService) {
    //  this.initService();
  }

  get user(): UserData {
    const user = this.authenticatedUser.getValue();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return user;
  }

  setUser(user: UserData): void {
    this.authenticatedUser.next(user);
  }

  getUser(): Observable<UserData> {
    return this.authenticatedUser.asObservable().pipe(filter((u): u is UserData => !!u));
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
