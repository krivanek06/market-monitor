import { Injectable } from '@angular/core';
import { GoogleAuthProvider, User, getAuth, signInWithPopup } from '@angular/fire/auth';
import { DocumentReference, collection, doc, getFirestore, setDoc } from '@angular/fire/firestore';
import { UserAccountType, UserData, UserPortfolioTransaction } from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/utils-client';
import { docData as rxDocData } from 'rxfire/firestore';
import { BehaviorSubject, Observable, map, take } from 'rxjs';
import { createNewUser } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private authenticatedUser$ = new BehaviorSubject<UserData | null>(null);
  private auth = getAuth();
  private db = getFirestore();

  constructor() {}

  getAuthenticatedUser(): void {
    //const auth = getAuth();
    const user = this.auth.currentUser;
    console.log(user);
  }

  getToken() {
    // todo
  }

  signIn() {
    // todo
  }

  register() {
    // todo
  }

  async signInGoogle() {
    const provider = new GoogleAuthProvider();
    const credentials = await signInWithPopup(this.auth, provider);
    this.getUserFromFirestoreUser(credentials.user)
      .pipe(take(1))
      .subscribe((userData) => {
        console.log('login', userData);
        this.authenticatedUser$.next(userData);
      });
    // this.authenticatedUser$.next(user);
    console.log('credentials', credentials);
    // console.log('user', user);
  }

  signOut() {
    // todo
  }

  changePassword() {
    // todo
  }

  resetPassword() {
    // todo
  }

  private getUserFromFirestoreUser(user: User): Observable<UserData> {
    return this.getUserById(user.uid).pipe(map((userData) => (userData ? userData : this.createUser(user))));
  }
  private getUserById(userId: string): Observable<UserData | undefined> {
    return rxDocData(this.getUserDocRef(userId), { idField: 'id' });
  }

  private createUser(user: User): UserData {
    // create new user data
    const newUserData = createNewUser(user.uid, {
      accountType: UserAccountType.ACCOUNT_TYPE_1,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });

    const newTransactions: UserPortfolioTransaction = {
      cashDeposit: [],
      transactions: [],
    };

    // update user
    this.updateUser(newUserData.id, newUserData);

    // create portfolio for user
    this.updateUserPortfolioTransaction(newUserData.id, newTransactions);

    // return new user data
    return newUserData;
  }

  private updateUserPortfolioTransaction(id: string, transaction: UserPortfolioTransaction): void {
    setDoc(this.getUserPortfolioTransactionDocRef(id), transaction, { merge: true });
  }

  private updateUser(id: string, user: Partial<UserData>): void {
    setDoc(this.getUserDocRef(id), user, { merge: true });
  }

  private getUserPortfolioTransactionDocRef(userId: string): DocumentReference<UserPortfolioTransaction> {
    return doc(this.db, 'users', userId, 'more_information', 'transactions').withConverter(
      assignTypesClient<UserPortfolioTransaction>(),
    );
  }

  private getUserDocRef(userId: string): DocumentReference<UserData> {
    return doc(collection(this.db, 'users').withConverter(assignTypesClient<UserData>()), userId);
  }
}
