import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserAccountTypes, accountDescription } from '@market-monitor/api-types';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { DialogCloseHeaderComponent } from '@market-monitor/shared/ui';
import { DialogServiceUtil } from '@market-monitor/shared/utils-client';
import { EMPTY, catchError, finalize, from, tap } from 'rxjs';

@Component({
  selector: 'app-user-account-type-select-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule, DialogCloseHeaderComponent],
  template: `
    <app-dialog-close-header title="Available Account Types"></app-dialog-close-header>

    <p class="text-center mb-6 md:w-9/12 mx-auto">
      At the current application development we have two accounts available for user. Read below their use and select
      wisely. You can change you account type anytime, however your trading history will be reset.
    </p>

    <mat-dialog-content class="p-4">
      <div class="grid md:grid-cols-2 gap-x-10 gap-y-4">
        @if (!showLoaderSignal()) {
          <!-- basic account -->
          <div>
            <div class="mb-2 text-lg text-wt-primary text-center">Basic Account</div>
            <div *ngFor="let text of accountDescription.Basic" class="mb-3 text-center">
              {{ text }}
            </div>
          </div>

          <!-- trading account -->
          <div>
            <div class="mb-2 text-lg text-wt-primary text-center">Trading Account</div>
            <div *ngFor="let text of accountDescription.Trading" class="mb-3 text-center">
              {{ text }}
            </div>
          </div>

          <!-- action buttons to align layout -->
          <div class="my-6 flex justify-center">
            <button
              (click)="changeAccount(UserAccountTypes.Basic)"
              mat-flat-button
              color="primary"
              [disabled]="userAccountTypeSignal() === UserAccountTypes.Basic"
            >
              Choose Basic Account
            </button>
          </div>
          <div class="my-6 flex justify-center">
            <button
              (click)="changeAccount(UserAccountTypes.Trading)"
              mat-flat-button
              color="primary"
              [disabled]="userAccountTypeSignal() === UserAccountTypes.Trading"
            >
              Choose Trading Account
            </button>
          </div>
        } @else {
          <div class="col-span-2 p-4 grid place-content-center">
            <mat-spinner></mat-spinner>
          </div>
        }
      </div>
    </mat-dialog-content>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAccountTypeSelectDialogComponent {
  private dialogServiceUtil = inject(DialogServiceUtil);
  private dialogRef = inject(MatDialogRef<UserAccountTypeSelectDialogComponent>);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private authenticationAccountService = inject(AuthenticationAccountService);

  userAccountTypeSignal = this.authenticationUserStoreService.state.getUserAccountType;

  accountDescription = accountDescription;
  UserAccountTypes = UserAccountTypes;

  showLoaderSignal = signal(false);

  changeAccount(selected: UserAccountTypes) {
    // notify user
    this.dialogServiceUtil.showNotificationBar('Changing account type, please wait...');
    this.showLoaderSignal.set(true);

    // perform operation
    from(this.authenticationAccountService.resetTransactions(selected))
      .pipe(
        tap(() => this.dialogServiceUtil.showNotificationBar('Your account has been changed and reset')),
        catchError((err) => {
          this.dialogServiceUtil.handleError(err);
          return EMPTY;
        }),
        finalize(() => this.showLoaderSignal.set(false)),
      )
      .subscribe();
  }
}
