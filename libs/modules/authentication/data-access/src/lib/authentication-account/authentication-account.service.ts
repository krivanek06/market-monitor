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
import { UserData, UserPortfolioTransaction, UserWatchlist } from '@market-monitor/api-types';
import { filterNullish } from '@market-monitor/shared/utils-client';
import { dateFormatDate } from '@market-monitor/shared/utils-general';
import { BehaviorSubject, Observable, Subject, map, switchMap } from 'rxjs';
import { LoginUserInput, RegisterUserInput, createNewUser } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private authenticatedUserData$ = new BehaviorSubject<UserData | null>(null);
  private authenticatedUser$ = new BehaviorSubject<User | null>(null);
  private loadedAuthentication$ = new Subject<boolean>();

  constructor(
    private auth: Auth,
    private userApiService: UserApiService,
  ) {
    this.initAuthenticationUser();
    this.listenOnUserChanges();
  }

  getUserData(): Observable<UserData> {
    return this.authenticatedUserData$.pipe(filterNullish());
  }

  getUser(): Observable<User | null> {
    return this.authenticatedUser$.asObservable();
  }

  getLoadedAuthentication(): Observable<boolean> {
    return this.loadedAuthentication$.asObservable();
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
        switchMap((user) =>
          this.userApiService
            .getUserData(user?.uid)
            .pipe(map((userData) => (userData ? userData : user ? this.createUser(user) : null))),
        ),
      )
      .subscribe((userData) => {
        console.log('UPDATING USER', userData);
        this.authenticatedUserData$.next(userData);
        this.loadedAuthentication$.next(true);
      });
  }

  private initAuthenticationUser(): void {
    this.auth.onAuthStateChanged((user) => {
      console.log('authentication state change', user);
      this.authenticatedUser$.next(user);

      if (user) {
        // wait some time before updating last login date so that user is already saved in authenticatedUserData
        setTimeout(() => {
          // update last login date
          this.userApiService.updateUser(user.uid, {
            lastLoginDate: dateFormatDate(new Date()),
          });
        }, 1000);
      }
    });
  }

  private createUser(user: User): UserData {
    // create new user data
    const newUserData = createNewUser(user.uid, {
      displayName: user.displayName ?? user.email?.split('@')[0] ?? `User_${user.uid}`,
      photoURL: user.photoURL,
    });

    const newTransactions: UserPortfolioTransaction = {
      transactions: [],
    };

    const newWatchList: UserWatchlist = {
      createdDate: dateFormatDate(new Date()),
      data: [],
    };

    // update user
    this.userApiService.updateUser(newUserData.id, newUserData);

    // create portfolio for user
    this.userApiService.updateUserPortfolioTransaction(newUserData.id, newTransactions);

    // create empty watchList
    this.userApiService.updateUserWatchList(newUserData.id, newWatchList);

    // return new user data
    return newUserData;
  }
}
