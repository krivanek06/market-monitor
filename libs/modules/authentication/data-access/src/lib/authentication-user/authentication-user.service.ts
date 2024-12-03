import { effect, inject, Injectable } from '@angular/core';
import { GroupApiService, OutstandingOrderApiService, UserApiService } from '@mm/api-client';
import {
  OutstandingOrder,
  PortfolioGrowth,
  PortfolioTransaction,
  UserAccountTypes,
  UserData,
  UserGroupData,
  UserWatchList,
} from '@mm/api-types';
import { getCurrentDateDefaultFormat, transformUserToBaseMin } from '@mm/shared/general-util';
import { User } from 'firebase/auth';
import { signalSlice } from 'ngxtension/signal-slice';
import { combineLatest, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';
import { hasUserAccess } from '../model';

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
  outstandingOrders: {
    openOrders: OutstandingOrder[];
    closedOrders: OutstandingOrder[];
  };
};

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserService {
  private readonly authenticationAccountService = inject(AuthenticationAccountService);
  private readonly groupApiService = inject(GroupApiService);
  private readonly outstandingOrderApiService = inject(OutstandingOrderApiService);
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
    outstandingOrders: {
      openOrders: [],
      closedOrders: [],
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

  private readonly userOutstandingOrdersSource$ = this.authenticationAccountService.getUserData().pipe(
    // prevent duplicate calls only when user id changes
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
    switchMap((userData) =>
      userData
        ? combineLatest([
            this.outstandingOrderApiService.getOutstandingOrdersOpen(userData.id),
            this.outstandingOrderApiService.getOutstandingOrdersClosed(userData.id),
          ]).pipe(
            map((orders) => ({
              openOrders: orders[0].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
              closedOrders: orders[1].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            })),
            map((orders) => ({
              outstandingOrders: {
                openOrders: orders.openOrders,
                closedOrders: orders.closedOrders,
              },
            })),
          )
        : of({ outstandingOrders: { openOrders: [], closedOrders: [] } }),
    ),
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
      this.userOutstandingOrdersSource$,
    ],
    selectors: (state) => ({
      getUser: () => state().user!,
      getUserData: () => state().userData!,
      getUserDataMin: () => transformUserToBaseMin(state().userData!),
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

  readonly userDataChange = effect(() => {
    console.log('AuthenticationUserStoreService update', this.state());
  });
}
