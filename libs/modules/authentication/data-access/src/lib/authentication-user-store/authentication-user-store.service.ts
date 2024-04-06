import { Injectable, InjectionToken, effect, inject } from '@angular/core';
import { GroupApiService, UserApiService } from '@mm/api-client';
import {
  PortfolioTransaction,
  SymbolType,
  UserAccountBasicTypes,
  UserAccountTypes,
  UserData,
  UserGroupData,
  UserWatchList,
} from '@mm/api-types';
import { getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import { User } from 'firebase/auth';
import { signalSlice } from 'ngxtension/signal-slice';
import { combineLatest, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';
import { hasUserAccess } from '../model';

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
  portfolioTransactions: PortfolioTransaction[] | null;
  watchList: UserWatchList;
};

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserStoreService {
  private authenticationAccountService = inject(AuthenticationAccountService);
  private groupApiService = inject(GroupApiService);
  private userApiService = inject(UserApiService);

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
    // prevent duplicate calls only when user id changes
    distinctUntilChanged((prev, curr) => prev === curr),
    map((loaded) => ({
      authenticationLoaded: !!loaded,
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
    // prevent duplicate calls only when user id changes
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
    switchMap((userData) =>
      userData ? this.userApiService.getUserWatchList(userData.id) : of(this.initialState.watchList),
    ),
    map((watchList) => ({ watchList: watchList })),
  );

  /**
   * Source used to get user portfolio transactions
   */
  private portfolioTransactionsSource$ = this.authenticationAccountService.getUserData().pipe(
    // prevent duplicate calls only when user id changes
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
    switchMap((userData) => (userData ? this.userApiService.getUserPortfolioTransactions(userData.id) : of(null))),
    map((transactions) => ({
      portfolioTransactions: transactions?.transactions ?? null,
    })),
  );

  /**
   * Source used to get user group data, owner, member, invitations, requested, watched
   */
  private userGroupDataSource$ = this.authenticationAccountService.getUserData().pipe(
    // prevent duplicate calls only when user id changes or groups changes
    distinctUntilChanged(
      (prev, curr) =>
        prev?.id === curr?.id && // user id changes - user logged in or out
        prev?.groups.groupOwner.length === curr?.groups.groupOwner.length && // group owner changes
        prev?.groups.groupMember.length === curr?.groups.groupMember.length && // group member changes
        prev?.groups.groupInvitations.length === curr?.groups.groupInvitations.length && // group invitations changes
        prev?.groups.groupRequested.length === curr?.groups.groupRequested.length && // group requested changes
        prev?.groups.groupWatched.length === curr?.groups.groupWatched.length, // group watched changes
    ),
    map((user) => user?.groups),
    switchMap((groups) =>
      groups
        ? combineLatest([
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
          )
        : of({
            userGroupData: {
              groupMember: [],
              groupOwner: [],
              groupInvitations: [],
              groupRequested: [],
              groupWatched: [],
            },
          }),
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
      getUserDataNormal: () => state().userData,
      getPortfolioState: () => state().userData?.portfolioState,
      getUserGroupData: () => state().userGroupData!,
      isSymbolInWatchList: () => (symbol: string) => !!state.watchList().data.find((d) => d.symbol === symbol),
      getUserPortfolioTransactions: () => state().portfolioTransactions,
      userHaveTransactions: () => (state().portfolioTransactions?.length ?? 0) > 0,

      // access computes
      hasUserAccess: () => (accountType: UserAccountTypes) => hasUserAccess(state().userData!, accountType),
      isAccountDemoTrading: () => hasUserAccess(state().userData, 'DEMO_TRADING'),
      isAccountNormalBasic: () => hasUserAccess(state().userData, 'NORMAL_BASIC'),
      isAccountNormalPaid: () => hasUserAccess(state().userData, 'NORMAL_PAID'),
      isAccountAdmin: () => hasUserAccess(state().userData, 'ADMIN'),
    }),
  });

  userDataChange = effect(() => {
    console.log('AuthenticationUserStoreService update', this.state());
  });

  changeUserPersonal(data: Partial<UserData['personal']>): void {
    this.userApiService.changeUserPersonal(this.state.getUserData(), data);
  }

  resetTransactions(data: UserAccountBasicTypes): Promise<void> {
    return this.userApiService.resetTransactions(this.state.getUserData().id, data);
  }

  changeUserSettings(data: Partial<UserData['settings']>): void {
    this.userApiService.changeUserSettings(this.state.getUserData(), data);
  }

  addSymbolToUserWatchList(symbol: string, symbolType: SymbolType): void {
    this.userApiService.addSymbolToUserWatchList(this.state.getUserData().id, symbol, symbolType);
  }

  removeSymbolFromUserWatchList(symbol: string, symbolType: SymbolType): void {
    this.userApiService.removeSymbolFromUserWatchList(this.state.getUserData().id, symbol, symbolType);
  }

  clearUserWatchList(): void {
    this.userApiService.clearUserWatchList(this.state.getUserData().id);
  }
}
