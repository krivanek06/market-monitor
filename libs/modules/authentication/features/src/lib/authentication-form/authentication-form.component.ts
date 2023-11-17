import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import {
  AUTHENTICATION_ERRORS,
  AuthenticationAccountService,
  LoginUserInput,
  RegisterUserInput,
} from '@market-monitor/modules/authentication/data-access';
import { FormLoginComponent, FormRegisterComponent } from '@market-monitor/modules/authentication/ui';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { DialogServiceModule, DialogServiceUtil } from '@market-monitor/shared/utils-client';
import { EMPTY, catchError, filter, from, switchMap, take, tap } from 'rxjs';

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
    DialogServiceModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './authentication-form.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticationFormComponent {
  loginUserInputControl = new FormControl<LoginUserInput | null>(null);
  registerUserInputControl = new FormControl<RegisterUserInput | null>(null);

  authenticationAccountService = inject(AuthenticationAccountService);
  dialogServiceUtil = inject(DialogServiceUtil);
  router = inject(Router);
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
            tap(() => {
              this.router.navigate([ROUTES_MAIN.DASHBOARD]);
              this.loadingSnipperShowSignal.set(false);
            }),
          ),
        ),
        take(1),
      )
      .subscribe((e) => console.log('google', e));
  }

  onDemoLogin(): void {
    this.loginUserInputControl.patchValue({
      email: 'krivanek1234+1@gmail.com',
      password: 'qwer1234',
    });
  }

  private watchLoginUserFormControl(): void {
    this.loginUserInputControl.valueChanges
      .pipe(
        filter((res): res is LoginUserInput => !!res),
        tap(() => this.loadingSnipperShowSignal.set(true)),
        switchMap((res) =>
          from(this.authenticationAccountService.signIn(res)).pipe(
            switchMap(() =>
              this.authenticationAccountService.getUserData().pipe(
                tap(() => {
                  this.router.navigate([ROUTES_MAIN.DASHBOARD]);
                  this.loadingSnipperShowSignal.set(false);
                }),
              ),
            ),
            catchError((err) => {
              console.log(err.code);
              this.loadingSnipperShowSignal.set(false);
              if (
                err?.code === AUTHENTICATION_ERRORS.WRONG_PASSWORD ||
                err?.code === AUTHENTICATION_ERRORS.USER_NOT_FOUND
              ) {
                this.dialogServiceUtil.showNotificationBar(`Email or Password is invalid`, 'error');
              } else {
                this.dialogServiceUtil.showNotificationBar(`Unable to log in`, 'error');
              }
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
        filter((res): res is RegisterUserInput => !!res),
        tap(() => this.loadingSnipperShowSignal.set(true)),
        switchMap((res) =>
          from(this.authenticationAccountService.register(res)).pipe(
            switchMap(() =>
              this.authenticationAccountService.getUserData().pipe(
                tap(() => {
                  this.router.navigate([ROUTES_MAIN.DASHBOARD]);
                  this.loadingSnipperShowSignal.set(false);
                }),
              ),
            ),
            catchError((err) => {
              if (err?.code === AUTHENTICATION_ERRORS.EMAIL_ALREADY_IN_USE) {
                this.dialogServiceUtil.showNotificationBar(`Email already in use`, 'error');
              } else {
                this.dialogServiceUtil.showNotificationBar(`Unable to create new user`, 'error');
              }
              this.loadingSnipperShowSignal.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((e) => console.log('ee', e));
  }
}
