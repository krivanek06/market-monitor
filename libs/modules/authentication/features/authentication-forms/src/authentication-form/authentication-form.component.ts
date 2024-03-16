import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgZone, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthenticationAccountService, LoginUserInput, RegisterUserInput } from '@mm/authentication/data-access';
import { IS_DEV_TOKEN, ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { filterNil } from 'ngxtension/filter-nil';
import { EMPTY, catchError, filter, from, switchMap, take, tap } from 'rxjs';
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
  private dialogServiceUtil = inject(DialogServiceUtil);
  private router = inject(Router);
  private zone = inject(NgZone);
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
            tap(() => {
              this.dialogServiceUtil.showNotificationBar('Successfully login', 'success');
              // getting error: Navigation triggered outside Angular zone, did you forget to call 'ngZone.run()
              this.zone.run(() => {
                this.router.navigate([ROUTES_MAIN.DASHBOARD]);
              });
            }),
          ),
        ),
        take(1),
      )
      .subscribe((e) => console.log('google', e));
  }

  onDemoLogin(): void {
    this.loginUserInputControl.patchValue({
      email: 'test_1@gmail.com',
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
                  this.dialogServiceUtil.showNotificationBar('Successfully login', 'success');
                  // getting error: Navigation triggered outside Angular zone, did you forget to call 'ngZone.run()
                  this.zone.run(() => {
                    this.router.navigate([ROUTES_MAIN.DASHBOARD]);
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
                filterNil(), // wait until there is a user initialized
                tap(() => {
                  this.dialogServiceUtil.showNotificationBar('User created successfully', 'success');
                  // getting error: Navigation triggered outside Angular zone, did you forget to call 'ngZone.run()
                  this.zone.run(() => {
                    this.router.navigate([ROUTES_MAIN.DASHBOARD]);
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
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
