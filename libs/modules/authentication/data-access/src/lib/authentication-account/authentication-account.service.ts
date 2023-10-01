import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';
import { DocumentReference, Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { UserAccountType, UserData, UserPortfolioTransaction } from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/utils-client';
import { docData as rxDocData } from 'rxfire/firestore';
import { BehaviorSubject, Observable, filter, map, take } from 'rxjs';
import { createNewUser } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private authenticatedUser$ = new BehaviorSubject<UserData | null>(null);
  private loadingAuthentication$ = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: Auth,
    private firestore: Firestore,
  ) {
    this.initAuthenticationUser();
  }

  getLoadingAuthentication(): Observable<boolean> {
    return this.loadingAuthentication$.asObservable();
  }

  getCurrentUser(): Observable<User | null> {
    return this.loadingAuthentication$.pipe(
      filter((loading) => !!loading),
      map(() => this.auth.currentUser),
      take(1),
    );
  }

  getCurrentUserData(): Observable<UserData | null> {
    return this.loadingAuthentication$.pipe(
      filter((loading) => !!loading),
      map(() => this.authenticatedUser$.value),
      take(1),
    );
  }

  async signIn(email: string, password: string) {
    const data = signInWithEmailAndPassword(this.auth, email, password);
    console.log('sign in ', data);
  }

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password);
  }

  signInGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider);
  }

  signOut() {
    this.auth.signOut();
  }

  changePassword() {
    // todo
  }

  resetPassword() {
    // todo
  }

  private initAuthenticationUser(): void {
    this.auth.onAuthStateChanged((user) => {
      console.log('authentication state change', user);
      if (user) {
        this.getUserFromFirestoreUser(user)
          .pipe(take(1))
          .subscribe((userData) => {
            console.log('login', userData);
            this.authenticatedUser$.next(userData);
            this.loadingAuthentication$.next(true);
          });
      } else {
        // logout
        this.authenticatedUser$.next(null);
        this.loadingAuthentication$.next(true);
      }
    });
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
    return doc(this.firestore, 'users', userId, 'more_information', 'transactions').withConverter(
      assignTypesClient<UserPortfolioTransaction>(),
    );
  }

  private getUserDocRef(userId: string): DocumentReference<UserData> {
    return doc(collection(this.firestore, 'users').withConverter(assignTypesClient<UserData>()), userId);
  }
}
