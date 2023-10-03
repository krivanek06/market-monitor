import { Injectable, InjectionToken } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';
import { DocumentReference, Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { UserAccountType, UserData, UserPortfolioTransaction } from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/utils-client';
import { docData as rxDocData } from 'rxfire/firestore';
import { BehaviorSubject, Observable, filter, map, take } from 'rxjs';
import { LoginUserInput, RegisterUserInput, createNewUser } from '../model';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationAccountService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private authenticatedUserData$ = new BehaviorSubject<UserData | null>(null);
  private authenticationLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: Auth,
    private firestore: Firestore,
  ) {
    this.initAuthenticationUser();
  }

  get user(): User {
    if (!this.auth.currentUser) {
      throw new Error('User not logged in');
    }
    return this.auth.currentUser;
  }

  get userData(): UserData {
    if (!this.authenticatedUserData$.value) {
      throw new Error('User not logged in');
    }
    return this.authenticatedUserData$.value;
  }

  isAuthenticationLoaded(): Observable<boolean> {
    return this.authenticationLoaded$.asObservable();
  }

  getCurrentUser(): Observable<User | null> {
    return this.authenticationLoaded$.pipe(
      filter((loading) => !!loading),
      map(() => this.auth.currentUser),
      take(1),
    );
  }

  getCurrentUserData(): Observable<UserData | null> {
    return this.authenticationLoaded$.pipe(
      filter((loading) => !!loading),
      map(() => this.authenticatedUserData$.value),
      take(1),
    );
  }

  updateUserData(userData: Partial<UserData>): void {
    this.updateUser(this.userData.id, userData);
  }

  signIn(input: LoginUserInput): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, input.email, input.password);
  }

  register(input: RegisterUserInput): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, input.email, input.password);
  }

  signInGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
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
            this.authenticatedUserData$.next(userData);
            this.authenticationLoaded$.next(true);
          });
      } else {
        // logout
        this.authenticatedUserData$.next(null);
        this.authenticationLoaded$.next(true);
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
