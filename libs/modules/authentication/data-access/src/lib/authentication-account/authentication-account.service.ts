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
import { UserAccountType, UserData, UserPortfolioTransaction, UserWatchlist } from '@market-monitor/api-types';
import { isNonNullable } from '@market-monitor/shared/utils-client';
import { dateFormatDate } from '@market-monitor/shared/utils-general';
import { BehaviorSubject, Observable, map, take } from 'rxjs';
import { LoginUserInput, RegisterUserInput, createNewUser } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private authenticatedUserData$ = new BehaviorSubject<UserData | null>(null);
  private authenticationLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: Auth,
    private userApiService: UserApiService,
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
    await this.auth.signOut();
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
        console.log('logout');
        this.authenticatedUserData$.next(null);
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
      accountType: UserAccountType.ACCOUNT_TYPE_1,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });

    const newTransactions: UserPortfolioTransaction = {
      startingCash: 0,
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
