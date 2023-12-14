import { Injectable, InjectionToken, inject } from '@angular/core';
import { GroupApiService, UserApiService } from '@market-monitor/api-client';
import {
  PortfolioTransaction,
  SymbolType,
  UserData,
  UserGroupData,
  UserWatchlist as UserWatchList,
} from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';
import { User } from 'firebase/auth';
import { signalSlice } from 'ngxtension/signal-slice';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationAccountService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

type AuthenticationState = {
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
    user: null,
    userData: null,
    userGroupData: null,
    portfolioTransactions: [],
    watchList: {
      createdDate: getCurrentDateDefaultFormat(),
      data: [],
    },
  };

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
    ],
    actionSources: {
      // updates user data
      updateUserData: (state, action$: Observable<Partial<UserData>>) =>
        action$.pipe(
          map((userData) => ({
            userData: {
              ...state().userData!,
              ...userData,
            },
          })),
        ),
      // add symbol into watch list
      addSymbolToUserWatchList: (state, action$: Observable<{ symbol: string; symbolType: SymbolType }>) =>
        action$.pipe(
          map(({ symbol, symbolType }) => ({
            watchList: {
              ...state().watchList,
              data: [...state().watchList.data, { symbol, symbolType }],
            },
          })),
        ),

      // remove symbol from watch list
      removeSymbolFromUserWatchList: (state, action$: Observable<{ symbol: string; symbolType: SymbolType }>) =>
        action$.pipe(
          map(({ symbol, symbolType }) => ({
            watchList: {
              ...state().watchList,
              data: state().watchList.data.filter((d) => d.symbol !== symbol && d.symbolType !== symbolType),
            },
          })),
        ),
    },
    selectors: (state) => ({
      getUser: () => state().user!,
      getUserData: () => state().userData!,
      getUserGroupData: () => state().userGroupData!,
      getUserPortfolioTransactions: () => state().portfolioTransactions,
      isSymbolInWatchList: () => (symbol: string) => !!state.watchList().data.find((d) => d.symbol === symbol),
    }),
    // effects: (state) => ({
    //   updateWatchList: () => {
    //     this.userApiService.updateUserWatchList(state().userData!.id, state.watchList());
    //   },
    // }),
  });
}
