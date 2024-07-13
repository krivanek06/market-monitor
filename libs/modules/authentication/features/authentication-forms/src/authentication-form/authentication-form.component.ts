import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
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
import { UserAccountBasicTypes, UserAccountEnum } from '@mm/api-types';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
  LoginUserInput,
  RegisterUserInput,
} from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil, GenericDialogComponent } from '@mm/shared/dialog-manager';
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
    CommonModule,
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
  ],
  template: `
    @if (showContent()) {
      <mat-tab-group>
        <mat-tab label="Login">
          <app-form-login data-testid="auth-form-login-form" [formControl]="loginUserInputControl" />

          <div class="my-4">
            <mat-divider />
          </div>

          <!-- social media login -->
          <h2 class="text-wt-primary-dark text-center text-lg">Social Media Login</h2>

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

          <div class="my-4">
            <mat-divider />
          </div>

          <!-- development -->
          <h2 class="text-wt-primary-dark text-center text-lg">Demo Account Login</h2>
          <div class="mt-4 px-4">
            <button
              data-testid="auth-form-demo-login-button"
              matTooltip="Account will be valid for 7 days and then removed"
              mat-stroked-button
              color="accent"
              class="w-full"
              type="button"
              (click)="onDemoLogin()"
            >
              Demo Login
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
  loginUserInputControl = new FormControl<LoginUserInput | null>(null);
  registerUserInputControl = new FormControl<RegisterUserInput | null>(null);

  private authenticationAccountService = inject(AuthenticationAccountService);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private router = inject(Router);

  /** emit a value whether to use google or demo login */
  private loginType$ = new Subject<'google' | 'demo'>();

  private googleAuth$ = this.loginType$.pipe(
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
                    switchMap((accountType) =>
                      from(this.authenticationUserStoreService.resetTransactions(accountType)).pipe(
                        map(() => ({ data: userData, action: 'success' as const })),
                      ),
                    ),
                  )
                : of({ data: userData, action: 'success' as const }),
            ),
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

  private demoLogin$ = this.loginType$.pipe(
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
                this.dialogServiceUtil.showConfirmDialog(
                  `Demo Account Created.\n\n Email: ${result.userData.personal.email}\nPassword: ${result.password}\n\n You can change you password in settings`,
                ),
              ).pipe(
                switchMap(() =>
                  from(
                    this.authenticationAccountService.signIn({
                      email: result.userData.personal.email,
                      password: result.password,
                    }),
                  ).pipe(
                    switchMap(() =>
                      this.authenticationAccountService.getUserData().pipe(
                        filterNil(), // wait until there is a user initialized
                        map((userData) => ({ data: userData, action: 'success' as const })),
                      ),
                    ),
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

  private registerUser$ = this.registerUserInputControl.valueChanges.pipe(
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
                switchMap((accountType) =>
                  from(this.authenticationUserStoreService.resetTransactions(accountType)).pipe(
                    map(() => ({ data: userData, action: 'success' as const })),
                  ),
                ),
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

  private loginUser$ = this.loginUserInputControl.valueChanges.pipe(
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

  userAuthenticationState = toSignal(
    concat(
      of({ action: 'idle' as const, data: null, error: null }),
      merge(this.googleAuth$, this.demoLogin$, this.registerUser$, this.loginUser$),
    ),
    {
      initialValue: { action: 'idle', data: null, error: null },
    },
  );

  showContent = computed(() => {
    const state = this.userAuthenticationState();
    return state.action !== 'loading' && state.action !== 'success';
  });

  userAuthenticationStateEffect = effect(() => {
    const state = this.userAuthenticationState();

    if (state.action === 'success') {
      // display success message
      this.dialogServiceUtil.showNotificationBar('Successfully logged in', 'success');
      // navigate to dashboard
      this.router.navigate([ROUTES_MAIN.DASHBOARD]);
    } else if (state.action === 'error') {
      this.dialogServiceUtil.handleError(state.error);
    }
  });

  onGoogleAuth(): void {
    this.loginType$.next('google');
  }

  onDemoLogin() {
    this.loginType$.next('demo');
  }

  openSelectAccountType(): Observable<UserAccountBasicTypes | undefined> {
    // return this.dialog
    //   .open(AuthenticationNewAccountTypeChooseDialogComponent)
    //   .afterClosed()
    //   .pipe(tap(() => this.loadingSnipperShowSignal.set(false)));
    return of(UserAccountEnum.DEMO_TRADING);
  }
}
