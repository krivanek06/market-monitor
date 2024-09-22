import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
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
import {
  PortfolioTransaction,
  SymbolStoreBase,
  USER_DEFAULT_STARTING_CASH,
  UserAccountEnum,
  UserBase,
  UserData,
  UserPortfolioGrowthData,
  UserPortfolioTransaction,
  UserWatchList,
} from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { createEmptyPortfolioState } from '@mm/shared/general-util';
import { arrayUnion, updateDoc } from 'firebase/firestore';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { Observable, filter, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private firestore = inject(Firestore);
  private http = inject(HttpClient);

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

  changeUserPersonal(currentData: UserData, data: Partial<UserData['personal']>): void {
    this.updateUser(currentData.id, {
      personal: {
        ...currentData.personal,
        ...data,
      },
    });
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

  changeUserSettings(currentData: UserData, data: Partial<UserData['settings']>): void {
    this.updateUser(currentData.id, {
      settings: {
        ...currentData.settings,
        ...data,
      },
    });
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

  getUserPortfolioGrowth(userId: string): Observable<UserPortfolioGrowthData['data']> {
    return rxDocData(this.getUserPortfolioGrowthDocRef(userId))
      .pipe(filter((d): d is UserPortfolioGrowthData => !!d))
      .pipe(map((d) => d.data));
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
