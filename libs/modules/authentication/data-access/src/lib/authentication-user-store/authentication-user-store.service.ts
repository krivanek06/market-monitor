import { Injectable, InjectionToken, effect, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { GroupApiService, UserApiService } from '@mm/api-client';
import {
  PortfolioGrowth,
  PortfolioTransaction,
  SymbolStoreBase,
  UserAccountBasicTypes,
  UserAccountTypes,
  UserData,
  UserGroupData,
  UserWatchList,
} from '@mm/api-types';
import { getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import { User } from 'firebase/auth';
import { signalSlice } from 'ngxtension/signal-slice';
import { combineLatest, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';
import { hasUserAccess } from '../model';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationUserStoreService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

type AuthenticationState = {
  /**
   * flag to indicate if authentication is loaded
   * FAIL - user is not authenticated
   * SUCCESS - user is authenticated
   * LOADING - user authentication is loading (no data from firebase)
   */
  authenticationState: 'SUCCESS' | 'FAIL' | 'LOADING';

  /**
   * data of authenticated user
   */
  user: User | null;
  userData: UserData | null;
  userGroupData: UserGroupData | null;
  portfolioTransactions: PortfolioTransaction[] | null;
  watchList: UserWatchList;
  portfolioGrowth: PortfolioGrowth[] | null;
};

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserStoreService {
  private readonly authenticationAccountService = inject(AuthenticationAccountService);
  private readonly groupApiService = inject(GroupApiService);
  private readonly userApiService = inject(UserApiService);

  private readonly initialState: AuthenticationState = {
    authenticationState: 'LOADING',
    user: null,
    userData: null,
    userGroupData: null,
    portfolioTransactions: [],
    portfolioGrowth: [],
    watchList: {
      createdDate: getCurrentDateDefaultFormat(),
      data: [],
    },
  };

  private readonly loadedAuthenticationSource$ = this.authenticationAccountService.getLoadedAuthentication().pipe(
    // prevent duplicate calls only when user id changes
    distinctUntilChanged((prev, curr) => prev === curr),
    tap((loaded) => console.log('AuthenticationUserStoreService loaded', loaded)),
    map((loaded) => ({
      authenticationState: loaded ? ('SUCCESS' as const) : ('FAIL' as const),
    })),
  );

  /**
   * Source used to get user data
   */
  private readonly userSource$ = this.authenticationAccountService.getUser().pipe(
    map((user) => ({
      user: user,
    })),
  );

  /**
   * Source used to get user data
   */
  private readonly userDataSource$ = this.authenticationAccountService.getUserData().pipe(
    map((userData) => ({
      userData: userData,
    })),
  );

  /**
   * Source used to get user watchList
   */
  private readonly watchListSource$ = this.authenticationAccountService.getUserData().pipe(
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
  private readonly portfolioTransactionsSource$ = this.authenticationAccountService.getUserData().pipe(
    // prevent duplicate calls only when user id changes or changes account type
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id && prev?.userAccountType === curr?.userAccountType),
    switchMap((userData) => (userData ? this.userApiService.getUserPortfolioTransactions(userData.id) : of(null))),
    map((transactions) => ({
      portfolioTransactions: transactions?.transactions ?? null,
    })),
  );

  private readonly userPortfolioGrowthSource$ = this.authenticationAccountService.getUserData().pipe(
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
    switchMap((userData) => (userData ? this.userApiService.getUserPortfolioGrowth(userData.id) : of(null))),
    map((data) => ({ portfolioGrowth: data })),
  );

  /**
   * Source used to get user group data, owner, member, invitations, requested, watched
   */
  private readonly userGroupDataSource$ = this.authenticationAccountService.getUserData().pipe(
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

  readonly state = signalSlice({
    initialState: this.initialState,
    sources: [
      this.userSource$,
      this.userDataSource$,
      this.watchListSource$,
      this.portfolioTransactionsSource$,
      this.userGroupDataSource$,
      this.loadedAuthenticationSource$,
      this.userPortfolioGrowthSource$,
    ],
    selectors: (state) => ({
      getUser: () => state().user!,
      getUserData: () => state().userData!,
      getUserDataNormal: () => state().userData,
      getUserGroupData: () => state().userGroupData!,
      isSymbolInWatchList: () => (symbol: string) => !!state.watchList().data.find((d) => d.symbol === symbol),
      getUserPortfolioTransactions: () => state().portfolioTransactions,
      getUserPortfolioTransactionsBest: () =>
        (state().portfolioTransactions ?? [])
          .filter((d) => d.transactionType === 'SELL')
          .filter((d) => d.returnValue > 0)
          .sort((a, b) => b.returnValue - a.returnValue)
          .slice(0, 6),
      getUserPortfolioTransactionsWorst: () =>
        (state().portfolioTransactions ?? [])
          .filter((d) => d.transactionType === 'SELL')
          .filter((d) => d.returnValue < 0)
          .sort((a, b) => a.returnValue - b.returnValue)
          .slice(0, 6),

      userHaveTransactions: () => (state().portfolioTransactions?.length ?? 0) > 0,

      // access computes
      hasUserAccess: () => (accountType: UserAccountTypes) => hasUserAccess(state().userData!, accountType),
      isAccountDemoTrading: () => hasUserAccess(state().userData, 'DEMO_TRADING'),
      isAccountNormalBasic: () => hasUserAccess(state().userData, 'NORMAL_BASIC'),
      isDemoAccount: () => !!state().userData?.isDemo,
    }),
  });

  readonly stateUserData$ = toObservable(this.state.userData);

  userDataChange = effect(() => {
    console.log('AuthenticationUserStoreService update', this.state());
  });

  changeUserPersonal(data: Partial<UserData['personal']>): void {
    this.userApiService.changeUserPersonal(this.state.getUserData(), data);
  }

  resetTransactions(): void {
    this.userApiService.resetTransactions(this.state.getUserData());
  }

  changeAccountType(data: UserAccountBasicTypes): void {
    const userData = this.state.getUserData();

    // update user account type
    this.userApiService.changeAccountType(userData, data);

    // remove user from groups
    userData.groups.groupMember.forEach((groupId) => this.groupApiService.leaveGroup(groupId));

    // clear all sent invitations to groups
    userData.groups.groupInvitations.forEach((groupId) =>
      this.groupApiService.userDeclinesGroupInvitation({
        groupId,
        userId: userData.id,
      }),
    );

    // clear all requests to join groups
    userData.groups.groupRequested.forEach((groupId) =>
      this.groupApiService.removeRequestToJoinGroup({
        groupId,
        userId: userData.id,
      }),
    );
  }

  changeUserSettings(data: Partial<UserData['settings']>): void {
    this.userApiService.changeUserSettings(this.state.getUserData(), data);
  }

  addSymbolToUserWatchList(data: SymbolStoreBase): void {
    this.userApiService.addToUserWatchList(this.state.getUserData().id, data);
  }

  removeSymbolFromUserWatchList(data: SymbolStoreBase): void {
    this.userApiService.removeFromUserWatchList(this.state.getUserData().id, data);
  }

  clearUserWatchList(): void {
    this.userApiService.clearUserWatchList(this.state.getUserData().id);
  }

  updateUserData(data: Partial<UserData>): void {
    this.userApiService.updateUser(this.state.getUserData().id, data);
  }
}
