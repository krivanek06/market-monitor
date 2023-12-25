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
import { getFunctions, httpsCallable } from '@angular/fire/functions';
import { UserApiService } from '@market-monitor/api-client';
import { UserData } from '@market-monitor/api-types';
import { dateFormatDate } from '@market-monitor/shared/utils-general';
import { getApp } from 'firebase/app';
import { BehaviorSubject, Observable, Subject, from, of, switchMap } from 'rxjs';
import { LoginUserInput, RegisterUserInput } from '../model';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private functions = getFunctions(getApp());
  private authenticatedUserData$ = new BehaviorSubject<UserData | null>(null);
  private authenticatedUser$ = new BehaviorSubject<User | null>(null);
  private loadedAuthentication$ = new Subject<UserData['id'] | null>();

  constructor(
    private auth: Auth,
    private userApiService: UserApiService,
  ) {
    this.initAuthenticationUser();
    this.listenOnUserChanges();
  }

  getUserData(): Observable<UserData | null> {
    return this.authenticatedUserData$;
  }

  getUser(): Observable<User | null> {
    return this.authenticatedUser$.asObservable();
  }

  getLoadedAuthentication(): Observable<UserData['id'] | null> {
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

  signOut() {
    this.auth.signOut();
  }

  changePassword() {
    // todo
  }

  resetPassword() {
    // todo
  }

  changeDisplayName(displayName: string): void {
    const user = this.authenticatedUserData$.value;
    if (!user) {
      throw new Error('User is not authenticated');
    }

    this.userApiService.updateUser(user.id, {
      personal: {
        ...user.personal,
        displayName,
      },
    });
  }

  async resetTransactions(): Promise<void> {
    const user = this.authenticatedUser$.value;
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const callable = httpsCallable<string, void>(this.functions, 'userResetTransactionsCall');
    await callable(user.uid);
  }

  async deleteAccount(): Promise<void> {
    const userData = this.authenticatedUserData$.value;
    if (!userData) {
      throw new Error('User is not authenticated');
    }
    try {
      // delete groups
      const groupsToRemove = userData.groups.groupOwner.map((groupId) =>
        httpsCallable<string, unknown>(this.functions, 'groupDeleteCall')(groupId),
      );
      await Promise.all(groupsToRemove);

      // delete account
      const callable = httpsCallable<string, void>(this.functions, 'userDeleteAccountCall');
      await callable(userData.id);
    } catch (error) {
      console.error(error);
    }
  }

  private listenOnUserChanges(): void {
    this.authenticatedUser$
      .pipe(
        switchMap((user) =>
          this.userApiService
            .getUserData(user?.uid)
            .pipe(
              switchMap((userData) => (userData ? of(userData) : user ? from(this.userCreateAccount()) : of(null))),
            ),
        ),
      )
      .subscribe((userData) => {
        console.log('UPDATING USER', userData);
        // update user data
        this.authenticatedUserData$.next(userData);

        // notify about user change
        const value = userData ? userData.id : null;
        this.loadedAuthentication$.next(value);
      });
  }

  private async userCreateAccount(): Promise<UserData> {
    const callable = httpsCallable<User, UserData>(this.functions, 'userCreateAccountCall');
    const result = await callable();
    return result.data;
  }

  private initAuthenticationUser(): void {
    this.auth.onAuthStateChanged((user) => {
      console.log('authentication state change', user);
      this.authenticatedUser$.next(user);

      if (user) {
        // wait some time before updating last login date so that user is already saved in authenticatedUserData
        setTimeout(() => {
          console.log(`UPDATE LAST LOGIN for user ${user.displayName} : ${user.uid}`);
          // update last login date
          this.userApiService.updateUser(user.uid, {
            lastLoginDate: dateFormatDate(new Date()),
          });
        }, 10_000);
      }
    });
  }
}
