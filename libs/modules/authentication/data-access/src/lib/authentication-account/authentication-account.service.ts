import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  collection,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { UserAccountTypes, UserData, UserResetTransactionsInput } from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/data-access';
import { dateFormatDate } from '@market-monitor/shared/features/general-util';
import { docData as rxDocData } from 'rxfire/firestore';
import { BehaviorSubject, Observable, Subject, from, of, switchMap } from 'rxjs';
import { LoginUserInput, RegisterUserInput } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  private functions = inject(Functions);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private authenticatedUserData$ = new BehaviorSubject<UserData | null>(null);
  private authenticatedUser$ = new BehaviorSubject<User | null>(null);
  private loadedAuthentication$ = new Subject<UserData['id'] | null>();

  constructor() {
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

    this.updateUser(user.id, {
      personal: {
        ...user.personal,
        displayName,
      },
    });
  }

  async resetTransactions(accountTypeSelected: UserAccountTypes): Promise<void> {
    const user = this.authenticatedUser$.value;
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const callable = httpsCallable<UserResetTransactionsInput, void>(this.functions, 'userResetTransactionsCall');
    await callable({
      userId: user.uid,
      accountTypeSelected,
    });
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
          this.getUserById(user?.uid).pipe(
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
          this.updateUser(user.uid, {
            lastLoginDate: dateFormatDate(new Date()),
          });
        }, 10_000);
      }
    });
  }

  private getUserById(userId?: string): Observable<UserData | undefined> {
    if (!userId) {
      return of(undefined);
    }
    return rxDocData(this.getUserDocRef(userId), { idField: 'id' });
  }

  private updateUser(id: string, user: Partial<UserData>): void {
    setDoc(this.getUserDocRef(id), user, { merge: true });
  }

  private getUserDocRef(userId: string): DocumentReference<UserData> {
    return doc(this.userCollection(), userId);
  }

  private userCollection(): CollectionReference<UserData, DocumentData> {
    return collection(this.firestore, 'users').withConverter(assignTypesClient<UserData>());
  }
}
