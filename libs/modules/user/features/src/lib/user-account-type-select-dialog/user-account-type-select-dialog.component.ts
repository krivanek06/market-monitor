import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserAccountBasicTypes, UserAccountEnum, accountDescription } from '@mm/api-types';
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { Confirmable, DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';
import { EMPTY, catchError, finalize, from, tap } from 'rxjs';

@Component({
  selector: 'app-user-account-type-select-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule, DialogCloseHeaderComponent],
  template: `
    <app-dialog-close-header title="Available Account Types"></app-dialog-close-header>

    <p *ngIf="!showLoaderSignal()" class="text-center mb-6 md:w-9/12 mx-auto text-xl">
      At the current application development we have two accounts available for user. Read below their use and select
      wisely. You can change you account type anytime, however your trading history will be reset.
    </p>

    <mat-dialog-content class="p-4">
      <div class="grid md:grid-cols-2 gap-x-10 gap-y-4 mb-10">
        @if (!showLoaderSignal()) {
          <!-- basic account -->
          <div
            class="p-3 rounded-lg border "
            (click)="changeAccount(UserAccountTypes.NORMAL_BASIC)"
            [ngClass]="{
              'border-wt-primary border-2 pointer-events-none':
                userData().userAccountType === UserAccountTypes.NORMAL_BASIC,
              'g-clickable-hover opacity-85 hover:opacity-100 bg-wt-gray-light-strong hover:bg-transparent':
                userData().userAccountType !== UserAccountTypes.NORMAL_BASIC
            }"
          >
            <div class="mb-2 text-lg text-wt-primary text-center">Basic Account</div>
            <div *ngFor="let text of accountDescription.NORMAL_BASIC" class="mb-3 text-center">
              {{ text }}
            </div>
          </div>

          <!-- trading account -->
          <div
            (click)="changeAccount(UserAccountTypes.DEMO_TRADING)"
            class="p-3 rounded-lg border"
            [ngClass]="{
              'border-wt-primary border-2 pointer-events-none':
                userData().userAccountType === UserAccountTypes.DEMO_TRADING,
              'g-clickable-hover opacity-85 hover:opacity-100  bg-wt-gray-light-strong hover:bg-transparent':
                userData().userAccountType !== UserAccountTypes.DEMO_TRADING
            }"
          >
            <div class="mb-2 text-lg text-wt-primary text-center">Trading Account</div>
            <div *ngFor="let text of accountDescription.DEMO_TRADING" class="mb-3 text-center">
              {{ text }}
            </div>
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

  userData = this.authenticationUserStoreService.state.getUserData;

  accountDescription = accountDescription;
  UserAccountTypes = UserAccountEnum;

  showLoaderSignal = signal(false);

  @Confirmable('Are you sure you want to reset your account? Your trading history & groups will be removed')
  changeAccount(selected: UserAccountBasicTypes) {
    // notify user
    this.dialogServiceUtil.showNotificationBar('Changing account type, please wait...');
    this.showLoaderSignal.set(true);

    // check if user converting to basic account and is owner of groups
    if (selected === UserAccountEnum.NORMAL_BASIC && this.userData().groups.groupOwner.length > 0) {
      this.dialogServiceUtil.showNotificationBar(
        'You are owner of one or more groups. You cannot change to basic account type. First delete groups where you are the owner',
        'error',
        6000,
      );
      this.showLoaderSignal.set(false);
      return;
    }

    // perform operation
    from(this.authenticationAccountService.resetTransactions(selected))
      .pipe(
        tap(() => this.dialogServiceUtil.showNotificationBar('Your account has been changed and reset', 'success')),
        catchError((err) => {
          this.dialogServiceUtil.handleError(err);
          return EMPTY;
        }),
        finalize(() => this.showLoaderSignal.set(false)),
      )
      .subscribe();
  }
}
