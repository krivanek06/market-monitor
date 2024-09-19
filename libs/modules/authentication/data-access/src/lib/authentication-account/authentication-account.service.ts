import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  updatePassword,
} from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { UserApiService } from '@mm/api-client';
import { UserAccountBasicTypes, UserCreateDemoAccountInput, UserData, UserDataDemoData } from '@mm/api-types';
import { filterNil } from 'ngxtension/filter-nil';
import { BehaviorSubject, Observable, Subject, catchError, firstValueFrom, from, map, of, switchMap, take } from 'rxjs';
import { LoginUserInput, RegisterUserInput } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private readonly functions = inject(Functions);
  private auth = inject(Auth);
  private userApiService = inject(UserApiService);
  private authenticatedUserData$ = new BehaviorSubject<UserData | null>(null);
  private authenticatedUser$ = new BehaviorSubject<User | null>(null);
  private loadedAuthentication$ = new Subject<UserData['id'] | null>();

  constructor() {
    this.initAuthenticationUser();
    this.listenOnUserChanges();
  }

  get currentUser(): User {
    const user = this.authenticatedUser$.value;
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return user;
  }

  get currentUserData(): UserData {
    const user = this.authenticatedUserData$.value;
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return user;
  }

  isUserNewUser = toSignal(
    this.getUser().pipe(map((user) => (user ? user.metadata.creationTime === user.metadata.lastSignInTime : false))),
    { initialValue: false },
  );

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

  async registerDemoAccount(accountType: UserAccountBasicTypes): Promise<UserDataDemoData> {
    // get public IP
    const publicIP = await firstValueFrom(this.userApiService.getUserPublicIp());

    // create demo account
    const callable = httpsCallable<UserCreateDemoAccountInput, UserDataDemoData>(
      this.functions,
      'userCreateAccountDemoCall',
    );
    const result = await callable({
      accountType,
      publicIP,
    });
    return result.data;
  }

  async signOut() {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error(error);
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser.email) {
      throw new Error('User is not authenticated');
    }

    try {
      // check if old password is correct
      const credentials = EmailAuthProvider.credential(this.currentUser.email, oldPassword);
      console.log('credentials', credentials);
      const reauth = await reauthenticateWithCredential(this.currentUser, credentials);
      console.log('reauth', reauth);
    } catch (error) {
      console.error(error);
      throw new Error('Old password is incorrect');
    }

    try {
      await updatePassword(this.currentUser, newPassword);
    } catch (error) {
      console.error(error);
      throw new Error('Password change failed');
    }
  }

  resetPassword() {
    // todo
  }

  async deleteAccount(): Promise<void> {
    const userData = this.authenticatedUserData$.value;
    if (!userData) {
      throw new Error('User is not authenticated');
    }
    try {
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
          user
            ? this.userApiService.getUserById(user.uid).pipe(
                switchMap((userData) =>
                  userData
                    ? of(userData)
                    : from(this.userCreateAccount()).pipe(
                        catchError((error) => {
                          console.log(error);
                          return of(null);
                        }),
                      ),
                ),
              )
            : of(null),
        ),
      )
      .subscribe((userData) => {
        console.log('[Auth]: UPDATING USER', userData);
        // update user data
        this.authenticatedUserData$.next(userData);

        // notify about user change
        const value = userData && !!userData.personal ? userData.id : null;
        this.loadedAuthentication$.next(value);
      });
  }

  private initAuthenticationUser(): void {
    this.auth.onAuthStateChanged((user) => {
      console.log('[Auth]: authentication state change', user);
      this.authenticatedUser$.next(user);

      // update account to be active
      if (user) {
        this.authenticatedUserData$
          .asObservable()
          .pipe(filterNil(), take(1))
          .subscribe((userData) => {
            console.log('[Auth]: update user activate account');
            this.userApiService.updateUser(userData.id, {
              isAccountActive: true,
            });
          });
      }
    });
  }

  private async userCreateAccount(): Promise<UserData> {
    const callable = httpsCallable<User, UserData>(this.functions, 'userCreateAccountCall');
    const result = await callable();
    return result.data;
  }
}
