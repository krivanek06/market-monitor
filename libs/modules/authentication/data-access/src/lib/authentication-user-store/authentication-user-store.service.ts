import { Injectable, InjectionToken, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GroupApiService, UserApiService } from '@market-monitor/api-client';
import {
  PortfolioTransaction,
  SymbolType,
  UserData,
  UserGroupData,
  UserPortfolioTransaction,
  UserWatchlist,
} from '@market-monitor/api-types';
import { StorageSignalsService } from '@market-monitor/shared/utils-client';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';
import { User } from 'firebase/auth';
import { Observable, combineLatest, firstValueFrom, map, shareReplay, switchMap, tap } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationAccountService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

export type AuthenticationUserStoreServiceSignals = {
  user: User | null;
  userData: UserData | null;
  portfolioTransactions: PortfolioTransaction[];
  watchlist: UserWatchlist;
};

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserStoreService extends StorageSignalsService<AuthenticationUserStoreServiceSignals> {
  /**
   * prevent multiple calls to the api
   */
  private userPortfolioTransaction$ = this.authenticationAccountService.getUserData().pipe(
    switchMap((userData) => this.userApiService.getUserPortfolioTransactions(userData.id)),
    tap(() => console.log(`AuthenticationUserService: getUserPortfolioTransactions`)),
    shareReplay(1),
  );

  constructor(
    private authenticationAccountService: AuthenticationAccountService,
    private userApiService: UserApiService,
    private groupApiService: GroupApiService,
  ) {
    super('AuthenticationUserStoreService', {
      user: null,
      userData: null,
      portfolioTransactions: [],
      watchlist: {
        createdDate: getCurrentDateDefaultFormat(),
        data: [],
      },
    });

    this.initWatchlist();
    this.initPortfolioTransactions();
  }

  private initWatchlist() {
    this.authenticationAccountService
      .getUserData()
      .pipe(
        switchMap((userData) => this.userApiService.getUserWatchlist(userData.id)),
        takeUntilDestroyed(),
      )
      .subscribe((watchlist) => {
        this.setKey('watchlist', watchlist);
      });
  }

  private initPortfolioTransactions() {
    this.authenticationAccountService
      .getUserData()
      .pipe(
        switchMap((userData) => this.userApiService.getUserPortfolioTransactions(userData.id)),
        takeUntilDestroyed(),
      )
      .subscribe((portfolioTransactions) => {
        this.setKey('portfolioTransactions', portfolioTransactions.transactions);
      });
  }

  get user(): User {
    return this.authenticationAccountService.user;
  }

  get userData(): UserData {
    return this.authenticationAccountService.userData;
  }

  // get userSettings(): UserSettings {
  //   return this.userData.settings;
  // }

  // get isUserRoleAdmin(): boolean {
  //   return this.userData.personal.accountType === USER_ACCOUNT_TYPE.ADMIN;
  // }

  // get isUserRoleBasic(): boolean {
  //   return this.userData.personal.accountType === USER_ACCOUNT_TYPE.BASIC;
  // }

  // get isUserRoleSimulation(): boolean {
  //   return this.userData.personal.accountType === USER_ACCOUNT_TYPE.SIMULATION;
  // }

  getUserData(): Observable<UserData> {
    return this.authenticationAccountService.getUserData();
  }

  getIsUserNew(): Observable<boolean> {
    return this.getUserData().pipe(map((d) => d.accountResets.length === 0));
  }

  getUserGroupsData(): Observable<UserGroupData> {
    return this.getUserData().pipe(
      map((user) => user.groups),
      // distinctUntilChanged(), // TODO: add back
      switchMap((groups) =>
        combineLatest([
          this.groupApiService.getGroupsDataByIds(groups.groupMember),
          this.groupApiService.getGroupsDataByIds(groups.groupOwner),
          this.groupApiService.getGroupsDataByIds(groups.groupInvitations),
          this.groupApiService.getGroupsDataByIds(groups.groupRequested),
          this.groupApiService.getGroupsDataByIds(groups.groupWatched),
        ]).pipe(
          map(([groupMember, groupOwner, groupInvitations, groupRequested, groupWatched]) => ({
            groupMember,
            groupOwner,
            groupInvitations,
            groupRequested,
            groupWatched,
          })),
        ),
      ),
    );
  }

  getUserPortfolioTransactions = this.select((store) => store.portfolioTransactions);

  getUserPortfolioTransactionPromise(): Promise<UserPortfolioTransaction> {
    return firstValueFrom(this.userPortfolioTransaction$);
  }

  getUserWatchlist = this.select((store) => store.watchlist);
  isSymbolInWatchlist = (symbol: string) =>
    computed(() => !!this.getUserWatchlist().data.find((d) => d.symbol === symbol));

  updateUserData(userData: Partial<UserData>): void {
    this.userApiService.updateUser(this.userData.id, userData);
  }

  updateUserPortfolioTransactionData(transaction: Partial<UserPortfolioTransaction>): void {
    this.userApiService.updateUserPortfolioTransaction(this.userData.id, transaction);
  }

  addSymbolToUserWatchlist(symbol: string, symbolType: SymbolType) {
    return this.userApiService.addSymbolToUserWatchlist(this.userData.id, symbol, symbolType);
  }

  removeSymbolFromUserWatchlist(symbol: string, symbolType: SymbolType) {
    return this.userApiService.removeSymbolFromUserWatchlist(this.userData.id, symbol, symbolType);
  }

  // isSymbolInWatchlist(symbol: string): Observable<boolean> {
  //   return this.userWatchlist$.pipe(map((watchlist) => !!watchlist.data.find((d) => d.symbol === symbol)));
  // }
}
