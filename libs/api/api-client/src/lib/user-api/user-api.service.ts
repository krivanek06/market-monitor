import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  arrayRemove,
  collection,
  doc,
  limit,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import {
  AdminGeneralActions,
  PortfolioGrowth,
  PortfolioTransaction,
  SymbolStoreBase,
  USER_DEFAULT_STARTING_CASH,
  UserAccountEnum,
  UserBase,
  UserBaseMin,
  UserData,
  UserPortfolioGrowthData,
  UserPortfolioTransaction,
  UserWatchList,
} from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { createEmptyPortfolioState } from '@mm/shared/general-util';
import { arrayUnion, updateDoc } from 'firebase/firestore';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { Observable, filter, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly functions = inject(Functions);
  private readonly firestore = inject(Firestore);
  private readonly http = inject(HttpClient);

  getUserPublicIp(): Observable<string> {
    return this.http.get<{ ip: string }>('https://api.ipify.org?format=json').pipe(map((d) => d.ip));
  }

  /* user portfolio */
  getUserPortfolioTransactions(userId: string): Observable<UserPortfolioTransaction> {
    return rxDocData(this.getUserPortfolioTransactionDocRef(userId)).pipe(
      filter((d): d is UserPortfolioTransaction => !!d),
      map((d) => ({
        // sort ASC
        transactions: d.transactions,
      })),
    );
  }

  getUsersByIds(ids: string[]): Observable<UserData[]> {
    if (!ids || ids.length === 0) {
      return of([]);
    }
    return rxCollectionData(query(this.userCollection(), where('id', 'in', ids)));
  }

  getUserWatchList(userId: string): Observable<UserWatchList> {
    return rxDocData(this.getUserWatchlistDocRef(userId)).pipe(filter((d): d is UserWatchList => !!d));
  }

  resetTransactions(userBase: UserBase): void {
    const startingCash = userBase.userAccountType === UserAccountEnum.DEMO_TRADING ? USER_DEFAULT_STARTING_CASH : 0;

    // reset transactions
    updateDoc(this.getUserPortfolioTransactionDocRef(userBase.id), {
      transactions: [],
    });

    // reset user portfolio state
    this.updateUser(userBase.id, {
      portfolioState: {
        ...createEmptyPortfolioState(startingCash),
      },
      holdingSnapshot: {
        data: [],
        lastModifiedDate: '',
      },
    });

    // reset user portfolio growth
    setDoc(this.getUserPortfolioGrowthDocRef(userBase.id), {
      lastModifiedDate: '',
      data: [],
    });
  }

  changeAccountType(userBase: UserBase, accountTypeSelected: UserAccountEnum): void {
    const startingCash = accountTypeSelected === UserAccountEnum.DEMO_TRADING ? USER_DEFAULT_STARTING_CASH : 0;

    // reset transactions
    setDoc(this.getUserPortfolioTransactionDocRef(userBase.id), {
      transactions: [],
    });

    // reset user portfolio state
    this.updateUser(userBase.id, {
      portfolioState: {
        ...createEmptyPortfolioState(startingCash),
      },
      groups: {
        groupInvitations: [],
        groupMember: [],
        groupOwner: [],
        groupRequested: [],
        groupWatched: [],
      },
      userAccountType: accountTypeSelected,
    });

    // reset user portfolio growth
    setDoc(this.getUserPortfolioGrowthDocRef(userBase.id), {
      lastModifiedDate: '',
      data: [],
    });
  }

  /**
   * THIS ONLY WORKS FOR TESTING FUNCTIONS
   * run this to recalculate user's portfolio state based on previous transactions
   *
   * @param userBase - user whom to recalculate portfolio state
   * @returns true or false if the recalculation was successful
   */
  async recalculateUserPortfolioState(userBase: UserBaseMin): Promise<boolean> {
    const callable = httpsCallable<string, boolean>(this.functions, 'userRecalculatePortfolioCall');
    const result = await callable(userBase.id);
    return result.data;
  }

  /**
   *
   * @param name prefix name
   * @returns list of users by the name prefix
   */
  getUsersByName(name: string): Observable<UserData[]> {
    // ignore case sensitive - https://stackoverflow.com/questions/50005587/firestore-database-query-ignore-case-case-insenstive-and-like-clause
    return rxCollectionData(
      query(
        this.userCollection(),
        where('personal.displayNameLowercase', '>=', name.toLowerCase()),
        where('personal.displayNameLowercase', '<=', name.toLowerCase() + '\uf8ff'),
        where('isDemo', '==', false),
        limit(10),
      ),
    );
  }

  /* user */
  getUserById(userId?: string): Observable<UserData | undefined> {
    if (!userId) {
      return of(undefined);
    }
    return rxDocData(this.getUserDocRef(userId), { idField: 'id' });
  }

  addUserPortfolioTransactions(userId: string, data: PortfolioTransaction): void {
    updateDoc(this.getUserPortfolioTransactionDocRef(userId), {
      transactions: arrayUnion(data),
    });
  }

  addToUserWatchList(userId: string, data: SymbolStoreBase): void {
    updateDoc(this.getUserWatchlistDocRef(userId), {
      data: arrayUnion({
        symbol: data.symbol,
        symbolType: data.symbolType,
        sector: data.sector,
      }),
    });
  }

  removeFromUserWatchList(userId: string, data: SymbolStoreBase): void {
    updateDoc(this.getUserWatchlistDocRef(userId), {
      data: arrayRemove({
        symbol: data.symbol,
        symbolType: data.symbolType,
        sector: data.sector,
      }),
    });
  }

  clearUserWatchList(userId: string): void {
    updateDoc(this.getUserWatchlistDocRef(userId), {
      data: [],
    });
  }

  updateUser(id: string, user: Partial<UserData>): void {
    setDoc(this.getUserDocRef(id), user, { merge: true });
  }

  deletePortfolioTransactionForUser(userId: string, transaction: PortfolioTransaction): void {
    updateDoc(this.getUserPortfolioTransactionDocRef(userId), {
      transactions: arrayRemove(transaction),
    });
  }

  getUserPortfolioGrowth(userId: string): Observable<PortfolioGrowth[]> {
    return rxDocData(this.getUserPortfolioGrowthDocRef(userId)).pipe(map((d) => d?.data ?? []));
  }

  fireAdminAction(action: AdminGeneralActions) {
    const callable = httpsCallable<AdminGeneralActions, void>(this.functions, 'adminActionCall');
    return callable(action);
  }

  /* private */

  private getUserDocRef(userId: string): DocumentReference<UserData> {
    return doc(this.userCollection(), userId);
  }

  private getUserWatchlistDocRef(userId: string): DocumentReference<UserWatchList> {
    return doc(this.userCollectionMoreInformationRef(userId), 'watchlist').withConverter(
      assignTypesClient<UserWatchList>(),
    );
  }

  private getUserPortfolioTransactionDocRef(userId: string): DocumentReference<UserPortfolioTransaction> {
    return doc(this.userCollectionMoreInformationRef(userId), 'transactions').withConverter(
      assignTypesClient<UserPortfolioTransaction>(),
    );
  }

  private getUserPortfolioGrowthDocRef(userId: string): DocumentReference<UserPortfolioGrowthData> {
    return doc(this.userCollectionMoreInformationRef(userId), 'portfolio_growth').withConverter(
      assignTypesClient<UserPortfolioGrowthData>(),
    );
  }

  private userCollectionMoreInformationRef(userId: string): CollectionReference<DocumentData, DocumentData> {
    return collection(doc(this.userCollection(), userId), 'more_information');
  }

  private userCollection(): CollectionReference<UserData, DocumentData> {
    return collection(this.firestore, 'users').withConverter(assignTypesClient<UserData>());
  }
}
