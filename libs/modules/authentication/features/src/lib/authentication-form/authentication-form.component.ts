import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import {
  AUTHENTICATION_ERRORS,
  AuthenticationAccountService,
  LoginUserInput,
  RegisterUserInput,
} from '@market-monitor/modules/authentication/data-access';
import { FormLoginComponent, FormRegisterComponent } from '@market-monitor/modules/authentication/ui';
import { DialogServiceModule, DialogServiceUtil } from '@market-monitor/shared/utils-client';
import { EMPTY, catchError, filter, from, switchMap } from 'rxjs';

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

  isAuthenticationLoaded = toSignal(this.authenticationAccountService.isAuthenticationLoaded());

  constructor() {
    this.watchLoginUserFormControl();
    this.watchRegisterUserFormControl();
  }

  onGoogleAuth(): void {
    this.authenticationAccountService.signInGoogle();
  }

  onDemoLogin(): void {
    console.log('todo');
  }

  private watchLoginUserFormControl(): void {
    this.loginUserInputControl.valueChanges
      .pipe(
        filter((res): res is LoginUserInput => !!res),
        switchMap((res) =>
          from(this.authenticationAccountService.signIn(res)).pipe(
            // tap(() => {
            //   DialogServiceUtil.showNotificationBar(`You have been successfully logged in`, 'success');
            //   this.dialogRef.close(true);
            //   this.router.navigate([TOP_LEVEL_NAV.dashboard]);
            // }),
            catchError((err) => {
              console.log(err.code);
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
        switchMap((res) =>
          from(this.authenticationAccountService.register(res)).pipe(
            // tap(() => {
            //   DialogServiceUtil.showNotificationBar(`You have been successfully logged in`, 'success');
            //   this.dialogRef.close(true);
            //   this.router.navigate([TOP_LEVEL_NAV.dashboard]);
            // }),
            catchError((err) => {
              if (err?.code === AUTHENTICATION_ERRORS.EMAIL_ALREADY_IN_USE) {
                this.dialogServiceUtil.showNotificationBar(`Email already in use`, 'error');
              } else {
                this.dialogServiceUtil.showNotificationBar(`Unable to create new user`, 'error');
              }
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((e) => console.log('ee', e));
  }
}
