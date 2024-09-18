import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DEMO, UserAccountBasicTypes, UserAccountEnum } from '@mm/api-types';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
  LoginUserInput,
  RegisterUserInput,
} from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil, GenericDialogComponent } from '@mm/shared/dialog-manager';
import { StorageLocalService } from '@mm/shared/storage-local';
import { addDays, isAfter } from 'date-fns';
import { filterNil } from 'ngxtension/filter-nil';
import {
  Observable,
  Subject,
  catchError,
  concat,
  filter,
  first,
  from,
  map,
  merge,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { AuthenticationNewAccountTypeChooseDialogComponent } from './authentication-new-account-type-choose-dialog/authentication-new-account-type-choose-dialog.component';
import { FormLoginComponent } from './form-login/form-login.component';
import { FormRegisterComponent } from './form-register/form-register.component';

@Component({
  selector: 'app-authentication-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormLoginComponent,
    FormRegisterComponent,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    GenericDialogComponent,
    AuthenticationNewAccountTypeChooseDialogComponent,
    DatePipe,
  ],
  template: `
    @if (showContent()) {
      <mat-tab-group>
        <mat-tab label="Login">
          <app-form-login data-testid="auth-form-login-form" [formControl]="loginUserInputControl" />

          <div class="my-8">
            <mat-divider />
          </div>

          <!-- social media login -->
          <div class="mt-4 px-4">
            <button
              data-testid="auth-form-google-auth-button"
              mat-stroked-button
              (click)="onGoogleAuth()"
              color="warn"
              class="w-full"
            >
              Google
            </button>
          </div>

          <div class="my-8">
            <mat-divider />
          </div>

          <!-- development -->
          <div class="px-4">
            @if (demoAccountValid()) {
              <div class="mb-2 text-center">
                You have a demo account valid until: {{ demoAccountValidUntil() | date: 'HH:mm, MMMM d, y' }}
              </div>
            }
            <button
              data-testid="auth-form-demo-login-button"
              mat-stroked-button
              color="accent"
              class="w-full"
              type="button"
              (click)="onDemoLogin()"
            >
              {{ demoAccountValid() ? 'Use Active Demo Account' : 'Create Demo Account' }}
            </button>
          </div>
        </mat-tab>
        <mat-tab label="Register">
          <app-form-register data-testid="auth-form-registration-form" [formControl]="registerUserInputControl" />
        </mat-tab>
      </mat-tab-group>
    } @else {
      <!-- loader -->
      <div class="grid h-full w-full place-content-center place-items-center gap-4">
        <mat-spinner data-testid="auth-form-spinner" diameter="120" />
        <div class="text-wt-gray-medium text-lg">Checking Authentication</div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticationFormComponent {
  private readonly authenticationAccountService = inject(AuthenticationAccountService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly storageLocalService = inject(StorageLocalService);
  private readonly router = inject(Router);

  readonly loginUserInputControl = new FormControl<LoginUserInput | null>(null);
  readonly registerUserInputControl = new FormControl<RegisterUserInput | null>(null);

  /** emit a value whether to use google or demo login */
  private readonly loginType$ = new Subject<'google' | 'demo' | 'demoAlreadyCreated'>();

  private readonly googleAuth$ = this.loginType$.pipe(
    filter((type) => type === 'google'),
    switchMap(() =>
      from(this.authenticationAccountService.signInGoogle()).pipe(
        switchMap(() =>
          this.authenticationAccountService.getUserData().pipe(
            filterNil(), // wait until there is a user initialized
            first(),
            switchMap((userData) =>
              this.authenticationAccountService.isUserNewUser()
                ? from(this.openSelectAccountType()).pipe(
                    filterNil(),
                    tap((accountType) => this.authenticationUserStoreService.changeAccountType(accountType)),
                    map(() => ({ data: userData, action: 'success' as const })),
                    startWith({
                      action: 'loading' as const,
                      data: null,
                    }),
                  )
                : of({ data: userData, action: 'success' as const }),
            ),
            startWith({
              action: 'loading' as const,
              data: null,
            }),
          ),
        ),
        catchError((err) =>
          of({
            action: 'error' as const,
            error: err,
            data: null,
          }),
        ),
      ),
    ),
  );

  private readonly demoLogin$ = this.loginType$.pipe(
    filter((type) => type === 'demo'),
    switchMap(() =>
      this.openSelectAccountType().pipe(
        filterNil(),
        tap(() =>
          this.dialogServiceUtil.showNotificationBar(
            'Creating demo account, it may take few seconds',
            'notification',
            5000,
          ),
        ),
        switchMap((accountType) =>
          from(this.authenticationAccountService.registerDemoAccount(accountType)).pipe(
            switchMap((result) =>
              from(
                this.authenticationAccountService.signIn({
                  email: result.userData.personal.email,
                  password: result.password,
                }),
              ).pipe(
                tap(() =>
                  // save data into local storage
                  this.storageLocalService.saveDataLocal('demoAccount', {
                    email: result.userData.personal.email,
                    password: result.password,
                    createdDate: new Date().toString(),
                  }),
                ),
                switchMap(() =>
                  this.authenticationAccountService.getUserData().pipe(
                    filterNil(), // wait until there is a user initialized
                    map((userData) => ({ data: userData, action: 'success' as const })),
                  ),
                ),
              ),
            ),
            startWith({
              action: 'loading' as const,
              data: null,
            }),
            catchError((err) =>
              of({
                action: 'error' as const,
                error: err,
                data: null,
              }),
            ),
          ),
        ),
      ),
    ),
  );

  private readonly demoLoginAlreadyCreated$ = this.loginType$.pipe(
    filter((type) => type === 'demoAlreadyCreated'),
    switchMap(() =>
      from(
        this.authenticationAccountService.signIn({
          email: this.demoAccount()?.email ?? '',
          password: this.demoAccount()?.password ?? '',
        }),
      ).pipe(
        switchMap(() =>
          this.authenticationAccountService.getUserData().pipe(
            filterNil(), // wait until there is a user initialized
            map((userData) => ({ data: userData, action: 'success' as const })),
          ),
        ),
        startWith({
          action: 'loading' as const,
          data: null,
        }),
        catchError((err) =>
          of({
            action: 'error-demo-already-active' as const,
            error: err,
            data: null,
          }),
        ),
      ),
    ),
  );

  private readonly registerUser$ = this.registerUserInputControl.valueChanges.pipe(
    filterNil(),
    switchMap((res) =>
      from(this.authenticationAccountService.register(res)).pipe(
        switchMap(() =>
          this.authenticationAccountService.getUserData().pipe(
            filterNil(), // wait until there is a user initialized
            first(),
            switchMap((userData) =>
              from(this.openSelectAccountType()).pipe(
                filterNil(),
                tap((accountType) => this.authenticationUserStoreService.changeAccountType(accountType)),
                map(() => ({ data: userData, action: 'success' as const })),
              ),
            ),
          ),
        ),
        startWith({
          action: 'loading' as const,
          data: null,
        }),
        catchError((err) =>
          of({
            action: 'error' as const,
            error: err,
            data: null,
          }),
        ),
      ),
    ),
  );

  private readonly loginUser$ = this.loginUserInputControl.valueChanges.pipe(
    filterNil(),
    switchMap((res) =>
      from(this.authenticationAccountService.signIn(res)).pipe(
        switchMap(() =>
          this.authenticationAccountService.getUserData().pipe(
            filterNil(), // wait until there is a user initialized
            map((userData) => ({ data: userData, action: 'success' as const })),
          ),
        ),
        startWith({
          action: 'loading' as const,
          data: null,
        }),
        catchError((err) =>
          of({
            action: 'error' as const,
            error: err,
            data: null,
          }),
        ),
      ),
    ),
  );

  readonly userAuthenticationState = toSignal(
    concat(
      of({ action: 'idle' as const, data: null, error: null }),
      merge(this.googleAuth$, this.demoLogin$, this.registerUser$, this.loginUser$, this.demoLoginAlreadyCreated$),
    ),
    {
      initialValue: { action: 'idle', data: null, error: null },
    },
  );

  readonly demoAccount = computed(() => this.storageLocalService.localData().demoAccount);
  readonly demoAccountValidUntil = computed(() =>
    addDays(this.demoAccount()?.createdDate ?? '', USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DEMO),
  );
  readonly demoAccountValid = computed(() => isAfter(this.demoAccountValidUntil(), new Date()));

  readonly showContent = computed(() => {
    const state = this.userAuthenticationState();
    return state.action !== 'loading' && state.action !== 'success';
  });

  readonly userAuthenticationStateEffect = effect(() => {
    const state = this.userAuthenticationState();

    untracked(() => {
      if (state.action === 'success') {
        // display success message
        this.dialogServiceUtil.showNotificationBar('Successfully logged in', 'success');
        // navigate to dashboard
        this.router.navigate([ROUTES_MAIN.DASHBOARD]);
      } else if (state.action === 'error') {
        this.dialogServiceUtil.handleError(state.error);
      } else if (state.action === 'error-demo-already-active') {
        this.dialogServiceUtil.showNotificationBar('Demo account not longer works', 'error');
        // remove demo account
        this.storageLocalService.saveDataLocal('demoAccount', undefined);
      }
    });
  });

  onGoogleAuth() {
    this.loginType$.next('google');
  }

  async onDemoLogin() {
    // if user already has demo account, use it
    if (this.demoAccountValid()) {
      this.loginType$.next('demoAlreadyCreated');
      return;
    }

    // create demo account
    const confirm = await this.dialogServiceUtil.showConfirmDialog(
      `Demo account will be created and removed after ${USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DEMO} days, please confirm`,
    );

    if (confirm) {
      this.loginType$.next('demo');
    }
  }

  openSelectAccountType(): Observable<UserAccountBasicTypes | undefined> {
    // return this.dialog
    //   .open(AuthenticationNewAccountTypeChooseDialogComponent)
    //   .afterClosed()
    //   .pipe(tap(() => this.loadingSnipperShowSignal.set(false)));
    return of(UserAccountEnum.DEMO_TRADING);
  }
}
