import { Injectable, InjectionToken, effect, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { GroupApiService } from '@market-monitor/api-client';
import {
  PortfolioTransaction,
  PortfolioTransactionCreate,
  SymbolType,
  UserAccountTypes,
  UserData,
  UserGroupData,
  UserPortfolioTransaction,
  UserWatchlist as UserWatchList,
  UserWatchlist,
} from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/data-access';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { User } from 'firebase/auth';
import { signalSlice } from 'ngxtension/signal-slice';
import { docData as rxDocData } from 'rxfire/firestore';
import { Observable, combineLatest, distinctUntilChanged, filter, map, of, switchMap } from 'rxjs';
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
  private groupApiService = inject(GroupApiService);
  private firestore = inject(Firestore);
  private functions = inject(Functions);

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
    switchMap((userData) => (userData ? this.getUserWatchList() : of(this.initialState.watchList))),
    map((watchList) => ({ watchList: watchList })),
  );

  /**
   * Source used to get user portfolio transactions
   */
  private portfolioTransactionsSource$ = this.authenticationAccountService.getUserData().pipe(
    // prevent duplicate calls only when user id changes
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
    switchMap((userData) => (userData ? this.getUserPortfolioTransactions().pipe(map((d) => d.transactions)) : of([]))),
    map((transactions) => ({
      portfolioTransactions: transactions,
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
      getPortfolioState: () => state().userData?.portfolioState,
      getUserAccountType: () =>
        state().userData?.features?.allowPortfolioCashAccount ? UserAccountTypes.Trading : UserAccountTypes.Basic,
      getUserGroupData: () => state().userGroupData!,
      isSymbolInWatchList: () => (symbol: string) => !!state.watchList().data.find((d) => d.symbol === symbol),
      getUserPortfolioTransactions: () => state().portfolioTransactions,
      userHaveTransactions: () => state().portfolioTransactions.length > 0,
    }),
  });

  constructor() {
    effect(() => {
      console.log('AuthenticationUserStoreService update', this.state());
    });
  }

  updateUserWatchList(watchlist: Partial<UserWatchlist>): void {
    setDoc(this.getUserWatchlistDocRef(), watchlist, { merge: true });
  }

  addSymbolToUserWatchList(symbol: string, symbolType: SymbolType): Promise<void> {
    return updateDoc(this.getUserWatchlistDocRef(), {
      data: arrayUnion({
        symbol,
        symbolType,
      }),
    });
  }

  removeSymbolFromUserWatchList(symbol: string, symbolType: SymbolType): Promise<void> {
    return updateDoc(this.getUserWatchlistDocRef(), {
      data: arrayRemove({
        symbol,
        symbolType,
      }),
    });
  }

  clearUserWatchList(): void {
    updateDoc(this.getUserWatchlistDocRef(), {
      data: [],
    });
  }

  /**
   * create a new transaction for the authenticated user
   */
  async createPortfolioTransactionForUser(input: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    const callable = httpsCallable<PortfolioTransactionCreate, PortfolioTransaction>(
      this.functions,
      'portfolioCreateOperationCall',
    );
    const result = await callable(input);
    return result.data;
  }

  deletePortfolioTransactionForUser(transaction: PortfolioTransaction): void {
    updateDoc(this.getUserPortfolioTransactionDocRef(), {
      transactions: arrayRemove(transaction),
    });
  }

  private getUserPortfolioTransactions(): Observable<UserPortfolioTransaction> {
    return rxDocData(this.getUserPortfolioTransactionDocRef()).pipe(
      filter((d): d is UserPortfolioTransaction => !!d),
      map((d) => ({
        // sort ASC
        transactions: d.transactions.slice().sort((a, b) => (a.date > b.date ? 1 : -1)),
      })),
    );
  }

  private getUserWatchList(): Observable<UserWatchlist> {
    return rxDocData(this.getUserWatchlistDocRef()).pipe(filter((d): d is UserWatchlist => !!d));
  }

  private getUserPortfolioTransactionDocRef(): DocumentReference<UserPortfolioTransaction> {
    return doc(this.userCollectionMoreInformationRef(), 'transactions').withConverter(
      assignTypesClient<UserPortfolioTransaction>(),
    );
  }

  private getUserWatchlistDocRef(): DocumentReference<UserWatchlist> {
    return doc(this.userCollectionMoreInformationRef(), 'watchlist').withConverter(assignTypesClient<UserWatchlist>());
  }

  private userCollectionMoreInformationRef(): CollectionReference<DocumentData, DocumentData> {
    return collection(this.getUserDocRef(), 'more_information');
  }

  private getUserDocRef(): DocumentReference<UserData> {
    return doc(this.userCollection(), this.state.getUser().uid);
  }

  private userCollection(): CollectionReference<UserData, DocumentData> {
    return collection(this.firestore, 'users').withConverter(assignTypesClient<UserData>());
  }
}
