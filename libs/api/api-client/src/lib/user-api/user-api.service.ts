import { Injectable } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import {
  PortfolioTransaction,
  SymbolType,
  UserData,
  UserPortfolioTransaction,
  UserWatchlist,
} from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/utils-client';
import { docData as rxDocData } from 'rxfire/firestore';
import { Observable, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  constructor(private firestore: Firestore) {}

  /* user portfolio */
  getUserPortfolioTransactions(userId: string): Observable<UserPortfolioTransaction> {
    return rxDocData(this.getUserPortfolioTransactionDocRef(userId)).pipe(
      filter((d): d is UserPortfolioTransaction => !!d),
    );
  }

  addPortfolioTransactionForUser(transaction: PortfolioTransaction): void {
    updateDoc(this.getUserPortfolioTransactionDocRef(transaction.userId), {
      transactions: arrayUnion(transaction),
    });
  }

  deletePortfolioTransactionForUser(transaction: PortfolioTransaction): void {
    updateDoc(this.getUserPortfolioTransactionDocRef(transaction.userId), {
      transactions: arrayRemove(transaction),
    });
  }

  updateUserPortfolioTransaction(id: string, transaction: Partial<UserPortfolioTransaction>): void {
    setDoc(this.getUserPortfolioTransactionDocRef(id), transaction, { merge: true });
  }

  /* watchlist */

  getUserWatchlist(userId: string): Observable<UserWatchlist> {
    console.log('calling watchlist api');
    return rxDocData(this.getUserWatchlistDocRef(userId)).pipe(filter((d): d is UserWatchlist => !!d));
  }

  updateUserWatchlist(userId: string, watchlist: Partial<UserWatchlist>): void {
    setDoc(this.getUserWatchlistDocRef(userId), watchlist, { merge: true });
  }

  addSymbolToUserWatchlist(userId: string, symbol: string, symbolType: SymbolType): void {
    updateDoc(this.getUserWatchlistDocRef(userId), {
      data: arrayUnion({
        symbol,
        symbolType,
      }),
    });
  }

  removeSymbolFromUserWatchlist(userId: string, symbol: string, symbolType: SymbolType): void {
    updateDoc(this.getUserWatchlistDocRef(userId), {
      data: arrayRemove({
        symbol,
        symbolType,
      }),
    });
  }

  /* user */
  getUserData(userId: string): Observable<UserData | undefined> {
    return rxDocData(this.getUserDocRef(userId), { idField: 'id' });
  }

  updateUser(id: string, user: Partial<UserData>): void {
    setDoc(this.getUserDocRef(id), user, { merge: true });
  }

  /* private */

  private getUserDocRef(userId: string): DocumentReference<UserData> {
    return doc(collection(this.firestore, 'users').withConverter(assignTypesClient<UserData>()), userId);
  }

  private getUserPortfolioTransactionDocRef(userId: string): DocumentReference<UserPortfolioTransaction> {
    return doc(this.firestore, 'users', userId, 'more_information', 'transactions').withConverter(
      assignTypesClient<UserPortfolioTransaction>(),
    );
  }

  private getUserWatchlistDocRef(userId: string): DocumentReference<UserWatchlist> {
    return doc(this.firestore, 'users', userId, 'more_information', 'watchlist').withConverter(
      assignTypesClient<UserWatchlist>(),
    );
  }
}
