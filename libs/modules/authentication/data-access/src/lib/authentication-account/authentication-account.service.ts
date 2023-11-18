import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';
import { UserApiService } from '@market-monitor/api-client';
import { USER_ACCOUNT_TYPE, UserData, UserPortfolioTransaction, UserWatchlist } from '@market-monitor/api-types';
import { filterNullish, isNonNullable } from '@market-monitor/shared/utils-client';
import { dateFormatDate } from '@market-monitor/shared/utils-general';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { LoginUserInput, RegisterUserInput, createNewUser } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private authenticatedUserData$ = new BehaviorSubject<UserData | null>(null);
  private authenticatedUser$ = new BehaviorSubject<User | null>(null);

  /**
   * emits true when authentication is finished whether user if loaded or not. Used for guards
   */
  private authenticationLoaded$ = new BehaviorSubject<boolean>(false);

  private destroy$ = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: Auth,
    private userApiService: UserApiService,
  ) {
    this.initAuthenticationUser();
    this.listenOnUserChanges();
  }

  get user(): User {
    if (!this.authenticatedUser$.value) {
      throw new Error('User not logged in');
    }
    return this.authenticatedUser$.value;
  }

  get userData(): UserData {
    if (!this.authenticatedUserData$.value) {
      throw new Error('User not logged in');
    }
    return this.authenticatedUserData$.value;
  }

  get isUserDataPresent(): boolean {
    return !!this.authenticatedUserData$.value;
  }

  isAuthenticationLoaded(): Observable<boolean> {
    return this.authenticationLoaded$.asObservable();
  }

  getUserData(): Observable<UserData> {
    return this.authenticatedUserData$.pipe(isNonNullable());
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

  async signOut() {
    this.authenticatedUserData$.next(null);
    this.authenticatedUser$.next(null);
    await this.auth.signOut();
  }

  changePassword() {
    // todo
  }

  resetPassword() {
    // todo
  }

  private listenOnUserChanges(): void {
    this.authenticatedUser$
      .pipe(
        tap((c) => console.log('watch', c)),
        filterNullish(),
        switchMap((user) => this.getUserFromFirestoreUser(user)),
      )
      .subscribe((userData) => {
        console.log('UPDATING USER', userData);
        this.authenticationLoaded$.next(true);
        this.authenticatedUserData$.next(userData);
      });
  }

  private initAuthenticationUser(): void {
    this.auth.onAuthStateChanged((user) => {
      console.log('authentication state change', user);
      this.authenticatedUser$.next(user);
      if (!user) {
        console.log('USER UNAUTHENTICATED');
        this.authenticationLoaded$.next(true);
      }
    });
  }

  private getUserFromFirestoreUser(user: User): Observable<UserData> {
    return this.userApiService
      .getUserData(user.uid)
      .pipe(map((userData) => (userData ? userData : this.createUser(user))));
  }

  private createUser(user: User): UserData {
    // create new user data
    const newUserData = createNewUser(user.uid, {
      accountType: USER_ACCOUNT_TYPE.BASIC,
      displayName: user.displayName ?? user.email?.split('@')[0] ?? `User_${user.uid}`,
      photoURL: user.photoURL,
    });

    const newTransactions: UserPortfolioTransaction = {
      transactions: [],
    };

    const newWatchlist: UserWatchlist = {
      createdDate: dateFormatDate(new Date()),
      data: [],
    };

    // update user
    this.userApiService.updateUser(newUserData.id, newUserData);

    // create portfolio for user
    this.userApiService.updateUserPortfolioTransaction(newUserData.id, newTransactions);

    // create empty watchlist
    this.userApiService.updateUserWatchlist(newUserData.id, newWatchlist);

    // return new user data
    return newUserData;
  }
}
