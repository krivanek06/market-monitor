import { Injectable, InjectionToken, effect, inject } from '@angular/core';
import { GroupApiService, UserApiService } from '@market-monitor/api-client';
import {
  PortfolioTransaction,
  UserData,
  UserGroupData,
  UserWatchlist as UserWatchList,
} from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';
import { User } from 'firebase/auth';
import { signalSlice } from 'ngxtension/signal-slice';
import { combineLatest, map, switchMap } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationAccountService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

type AuthenticationState = {
  /**
   * flag to indicate if authentication is loaded
   */
  authenticationLoaded: boolean;

  /**
   * data of authenticated user
   */
  user: User | null;
  userData: UserData | null;
  userGroupData: UserGroupData | null;
  portfolioTransactions: PortfolioTransaction[];
  watchList: UserWatchList;
};

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserStoreService {
  private authenticationAccountService = inject(AuthenticationAccountService);
  private userApiService = inject(UserApiService);
  private groupApiService = inject(GroupApiService);

  private initialState: AuthenticationState = {
    authenticationLoaded: false,
    user: null,
    userData: null,
    userGroupData: null,
    portfolioTransactions: [],
    watchList: {
      createdDate: getCurrentDateDefaultFormat(),
      data: [],
    },
  };

  private loadedAuthenticationSource$ = this.authenticationAccountService.getLoadedAuthentication().pipe(
    map((loaded) => ({
      authenticationLoaded: loaded,
    })),
  );

  /**
   * Source used to get user data
   */
  private userSource$ = this.authenticationAccountService.getUser().pipe(
    map((user) => ({
      user: user,
    })),
  );

  /**
   * Source used to get user data
   */
  private userDataSource$ = this.authenticationAccountService.getUserData().pipe(
    map((userData) => ({
      userData: userData,
    })),
  );

  /**
   * Source used to get user watchList
   */
  private watchListSource$ = this.authenticationAccountService.getUserData().pipe(
    switchMap((userData) => this.userApiService.getUserWatchList(userData.id)),
    map((watchList) => ({ watchList: watchList })),
  );

  /**
   * Source used to get user portfolio transactions
   */
  private portfolioTransactionsSource$ = this.authenticationAccountService.getUserData().pipe(
    switchMap((userData) => this.userApiService.getUserPortfolioTransactions(userData.id)),
    map((userTransactions) => ({
      portfolioTransactions: userTransactions.transactions,
    })),
  );

  /**
   * Source used to get user group data, owner, member, invitations, requested, watched
   */
  private userGroupDataSource$ = this.authenticationAccountService.getUserData().pipe(
    map((user) => user.groups),
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
        map((userGroupData) => ({ userGroupData })),
      ),
    ),
  );

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      this.userSource$,
      this.userDataSource$,
      this.watchListSource$,
      this.portfolioTransactionsSource$,
      this.userGroupDataSource$,
      this.loadedAuthenticationSource$,
    ],
    selectors: (state) => ({
      getUser: () => state().user!,
      getUserData: () => state().userData!,
      getUserGroupData: () => state().userGroupData!,
      getUserPortfolioTransactions: () => state().portfolioTransactions,
      isSymbolInWatchList: () => (symbol: string) => !!state.watchList().data.find((d) => d.symbol === symbol),
    }),
  });

  constructor() {
    effect(() => {
      console.log('AuthenticationUserStoreService update', this.state());
    });
  }
}
