import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { UserAccountBasicTypes } from '@mm/api-types';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
  LoginUserInput,
  RegisterUserInput,
} from '@mm/authentication/data-access';
import { IS_DEV_TOKEN, ROUTES_MAIN } from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil, GenericDialogComponent } from '@mm/shared/dialog-manager';
import { filterNil } from 'ngxtension/filter-nil';
import { EMPTY, Observable, catchError, filter, first, from, map, of, switchMap, take, tap } from 'rxjs';
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
    GenericDialogComponent,
    AuthenticationNewAccountTypeChooseDialogComponent,
  ],
  template: `
    <div *ngIf="!isDevActive" class="mb-4 text-center text-xl">
      Application is currently under development, please come back later.
    </div>

    <mat-tab-group *ngIf="!loadingSnipperShowSignal(); else loader">
      <mat-tab label="Login">
        <app-form-login [formControl]="loginUserInputControl"></app-form-login>

        <div class="my-4">
          <mat-divider></mat-divider>
        </div>

        <!-- social media login -->
        <h2 class="text-lg text-center text-wt-primary-dark">Social Media Login</h2>

        <div class="px-4 mt-4">
          <button [disabled]="!isDevActive" mat-stroked-button (click)="onGoogleAuth()" color="warn" class="w-full">
            Google
          </button>
        </div>

        <div class="my-4">
          <mat-divider></mat-divider>
        </div>

        <!-- development -->
        <h2 class="text-lg text-center text-wt-primary-dark">Demo Account Login</h2>
        <div class="px-4 mt-4">
          <button
            [disabled]="!isDevActive"
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
      <mat-tab [disabled]="!isDevActive" label="Register">
        <app-form-register [formControl]="registerUserInputControl"></app-form-register>
      </mat-tab>
    </mat-tab-group>

    <!-- loader -->
    <ng-template #loader>
      <div class="grid w-full h-full gap-4 place-content-center place-items-center">
        <mat-spinner diameter="120"></mat-spinner>
        <div class="text-lg text-wt-gray-medium">Checking Authentication</div>
      </div>
    </ng-template>
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
  private dialog = inject(MatDialog);

  isDevActive = inject(IS_DEV_TOKEN, {
    optional: true,
  });

  loadingSnipperShowSignal = signal(false);

  constructor() {
    this.watchLoginUserFormControl();
    this.watchRegisterUserFormControl();
  }

  onGoogleAuth(): void {
    from(this.authenticationAccountService.signInGoogle())
      .pipe(
        tap(() => this.loadingSnipperShowSignal.set(true)),
        switchMap(() =>
          this.authenticationAccountService.getUserData().pipe(
            filterNil(), // wait until there is a user initialized
            first(),
            switchMap((userData) =>
              this.authenticationAccountService.isUserNewUser()
                ? from(this.openSelectAccountType()).pipe(
                    filterNil(),
                    tap((accountType) => this.newUserAccountTypeSelect(accountType)),
                    map(() => userData),
                  )
                : of(userData),
            ),
          ),
        ),
        take(1),
      )
      .subscribe((e) => {
        // display success message
        this.dialogServiceUtil.showNotificationBar('Successfully logged in', 'success');

        // navigate to dashboard
        this.router.navigate([ROUTES_MAIN.DASHBOARD]);
      });
  }

  @Confirmable(
    'The account you are about to create will be valid for 7 days and then removed.\n You will see you account fill with data for demo purposes.',
  )
  onDemoLogin() {
    this.openSelectAccountType()
      .pipe(
        take(1),
        filterNil(),
        tap(() => {
          // show loader
          this.loadingSnipperShowSignal.set(true);
          // show notification
          this.dialogServiceUtil.showNotificationBar(
            'Creating demo account, it may take few seconds',
            'notification',
            5000,
          );
        }),
        switchMap((accountType) =>
          from(this.authenticationAccountService.registerDemoAccount(accountType)).pipe(
            switchMap((result) =>
              from(
                this.dialogServiceUtil.showConfirmDialog(
                  `Demo Account Created.\n\n Email: ${result.userData.personal.email}\nPassword: ${result.password}\n\n You can change you password in settings`,
                ),
              ).pipe(
                filter((d) => !!d),
                tap(() => {
                  // login form will take care of login demo account
                  this.loginUserInputControl.patchValue({
                    email: result.userData.personal.email,
                    password: result.password,
                  });
                }),
              ),
            ),
            catchError((err) => {
              this.dialogServiceUtil.handleError(err);
              this.loadingSnipperShowSignal.set(false);
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();
  }

  private async newUserAccountTypeSelect(type: UserAccountBasicTypes) {
    this.dialog.closeAll();

    // check if user does not yet exist
    if (!this.authenticationUserStoreService.state.userData) {
      this.dialogServiceUtil.showNotificationBar('User does not exist', 'error');
      return;
    }

    // reset account with corresponding type
    await this.authenticationUserStoreService.resetTransactions(type);

    // display success message
    this.dialogServiceUtil.showNotificationBar('Successfully logged in', 'success');

    // navigate to dashboard
    this.router.navigate([ROUTES_MAIN.DASHBOARD]);
  }

  private watchLoginUserFormControl(): void {
    this.loginUserInputControl.valueChanges
      .pipe(
        filterNil(),
        tap(() => this.loadingSnipperShowSignal.set(true)),
        switchMap((res) =>
          from(this.authenticationAccountService.signIn(res)).pipe(
            switchMap(() =>
              this.authenticationAccountService.getUserData().pipe(
                filterNil(), // wait until there is a user initialized
                tap(() => {
                  // display success message
                  this.dialogServiceUtil.showNotificationBar('Successfully logged in', 'success');
                  // navigate to dashboard
                  this.router.navigate([ROUTES_MAIN.DASHBOARD]);
                }),
              ),
            ),
            catchError((err) => {
              this.dialogServiceUtil.handleError(err);
              this.loadingSnipperShowSignal.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((e) => console.log('ee', e));
  }

  private watchRegisterUserFormControl(): void {
    this.registerUserInputControl.valueChanges
      .pipe(
        filterNil(),
        tap(() => this.loadingSnipperShowSignal.set(true)),
        switchMap((res) =>
          from(this.authenticationAccountService.register(res)).pipe(
            switchMap(() =>
              this.authenticationAccountService.getUserData().pipe(
                filterNil(), // wait until there is a user initialized
                first(),
                switchMap(() =>
                  from(this.openSelectAccountType()).pipe(
                    filterNil(),
                    switchMap((accountType) => from(this.newUserAccountTypeSelect(accountType))),
                  ),
                ),
              ),
            ),
            catchError((err) => {
              this.dialogServiceUtil.handleError(err);
              this.loadingSnipperShowSignal.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private openSelectAccountType(): Observable<UserAccountBasicTypes | undefined> {
    return this.dialog
      .open(AuthenticationNewAccountTypeChooseDialogComponent)
      .afterClosed()
      .pipe(tap(() => this.loadingSnipperShowSignal.set(false)));
  }
}
