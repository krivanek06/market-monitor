import { Injectable } from '@angular/core';
import { User, UserAccountType } from '@market-monitor/api-types';
import { BehaviorSubject, Observable, filter } from 'rxjs';

const mockUser: User = {
  id: '1',
  groups: {
    groupInvitations: [],
    groupMember: [],
    groupOwner: [],
    groupWatched: [],
  },
  favoriteSymbols: [
    {
      symbol: 'AAPL',
      symbolType: 'STOCK',
    },
    {
      symbol: 'TSLA',
      symbolType: 'STOCK',
    },
    {
      symbol: 'MSFT',
      symbolType: 'STOCK',
    },
  ],
  lastSearchedSymbols: [
    {
      symbol: 'CLOV',
      symbolType: 'STOCK',
    },
    {
      symbol: 'AMC',
      symbolType: 'STOCK',
    },
  ],
  settings: {
    isCreatingGroupAllowed: true,
    isPortfolioCashActive: true,
  },
  personal: {
    accountCreated: '2021-07-01T00:00:00.000Z',
    accountType: UserAccountType.ACCOUNT_TYPE_1,
    authentication: {
      authenticationType: 'GOOGLE',
      token: '123',
    },
    displayName: 'John Doe',
    email: 'test@gmail.com',
    isVerified: true,
    lastSignIn: '2021-07-01T00:00:00.000Z',
    photoURL: null,
  },
  portfolioRisk: null,
  portfolio: {
    numberOfExecutedBuyTransactions: 4,
    numberOfExecutedSellTransactions: 2,
    portfolioCash: 5000,
    transactionFees: 40,
  },
  holdings: [
    {
      invested: 3240.3,
      symbol: 'AAPL',
      symbolType: 'STOCK',
      units: 30,
    },
    {
      invested: 500.0,
      symbol: 'TSLA',
      symbolType: 'STOCK',
      units: 1,
    },
    {
      invested: 2000.0,
      symbol: 'MSFT',
      symbolType: 'STOCK',
      units: 10,
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class UserAuthenticatedService {
  private authenticatedUser = new BehaviorSubject<User | null>(mockUser);
  constructor() {}

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
}
