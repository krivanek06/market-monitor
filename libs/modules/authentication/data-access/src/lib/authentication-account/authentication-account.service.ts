import { Injectable, inject } from '@angular/core';
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
import { UserApiService } from '@mm/api-client';
import { UserData } from '@mm/api-types';
import { getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import { BehaviorSubject, Observable, Subject, catchError, from, of, switchMap } from 'rxjs';
import { LoginUserInput, RegisterUserInput } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
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
      this.userApiService.deleteAccount(userData);
    } catch (error) {
      console.error(error);
    }
  }

  private listenOnUserChanges(): void {
    this.authenticatedUser$
      .pipe(
        switchMap((user) =>
          this.userApiService.getUserById(user?.uid).pipe(
            switchMap((userData) =>
              userData
                ? of(userData)
                : user
                  ? from(this.userApiService.userCreateAccount()).pipe(
                      catchError((error) => {
                        console.log(error);
                        return of(null);
                      }),
                    )
                  : of(null),
            ),
          ),
        ),
      )
      .subscribe((userData) => {
        console.log('UPDATING USER', userData);
        // update user data
        this.authenticatedUserData$.next(userData);

        // notify about user change
        const value = userData && !!userData.personal ? userData.id : null;
        this.loadedAuthentication$.next(value);
      });
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
            lastLoginDate: getCurrentDateDefaultFormat(),
            isAccountActive: true,
          });
        }, 20_000);
      }
    });
  }
}
