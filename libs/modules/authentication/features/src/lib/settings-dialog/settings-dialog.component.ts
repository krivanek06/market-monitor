import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { UploadImageSingleControlComponent } from '@market-monitor/shared/features';
import { DialogCloseHeaderComponent } from '@market-monitor/shared/ui';
import { Confirmable, DialogServiceModule, DialogServiceUtil } from '@market-monitor/shared/utils-client';
import { EMPTY, catchError, from, tap } from 'rxjs';
import { AccountTypes, accountDescription, actionButtonTooltips } from './settings-dialog.model';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DialogServiceModule,
    MatDialogModule,
    DialogCloseHeaderComponent,
    MatDividerModule,
    UploadImageSingleControlComponent,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  template: `
    <app-dialog-close-header title="Settings"></app-dialog-close-header>

    <mat-dialog-content class="min-h-[350px] flex flex-col-reverse md:flex-row">
      <div class="flex-1 md:border-r border-wt-border">
        <div class="flex gap-6">
          <!-- user image -->
          <div>
            <app-upload-image-single-control
              [heightPx]="225"
              [formControl]="userImageControl"
            ></app-upload-image-single-control>
          </div>
          <!-- user data -->
          <div class="pt-2 text-lg">
            <div class="c-text-item">
              <span>Display Name:</span>
              <span>{{ userDataSignal().personal.displayName }}</span>
            </div>
            <div class="c-text-item">
              <span>Email:</span>
              <span>{{ userSignal().email }}</span>
            </div>
            <div class="c-text-item">
              <span>Created:</span>
              <span>{{ userDataSignal().accountCreatedDate | date: 'MMMM d, y' }}</span>
            </div>
            <div class="c-text-item">
              <span>Account Type:</span>
              <span> {{ accountTypeSignal() }}</span>
            </div>
            <div *ngIf="accountTypeSignal() === 'Trading'" class="c-text-item">
              <span>Starting Cash:</span>
              <span> {{ userDataSignal().portfolioState.startingCash | currency }}</span>
            </div>
          </div>
        </div>

        <!-- explain account type -->
        <div class="p-4">
          <div class="mb-2 text-lg text-wt-primary">{{ accountTypeSignal() }} - Account</div>
          <div *ngFor="let text of accountDescriptionSignal()" class="mb-3">
            {{ text }}
          </div>
        </div>
      </div>

      <!-- action buttons -->
      <div class="flex flex-col gap-y-2 min-w-[180px] pl-6">
        <!-- <button
      (click)="onChangeDisplayName()"
      [matTooltip]="actionButtonTooltips.changeDisplayName"
      type="button"
      mat-stroked-button
      color="accent"
    >
      Change Display Name
    </button> -->
        <button
          (click)="onResetTransactions()"
          [matTooltip]="actionButtonTooltips.resetTransactions"
          type="button"
          mat-stroked-button
          color="primary"
        >
          Reset Transactions
        </button>
        <button
          *ngIf="userDataSignal().personal.providerId === 'password'"
          (click)="onChangePassword()"
          [matTooltip]="actionButtonTooltips.changePassword"
          type="button"
          mat-stroked-button
          color="warn"
        >
          Change Password
        </button>
        <button
          (click)="onDeleteAccount()"
          [matTooltip]="actionButtonTooltips.deleteAccount"
          type="button"
          mat-flat-button
          color="warn"
        >
          Delete Account
        </button>
      </div>
    </mat-dialog-content>

    <div class="my-4">
      <mat-divider></mat-divider>
    </div>

    <mat-dialog-actions>
      <div class="g-mat-dialog-actions-end">
        <button mat-flat-button mat-dialog-close type="button">Cancel</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
    }

    .c-text-item {
      display: flex;
      :first-child {
        min-width: 150px;
        color: var(--gray-dark);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDialogComponent implements OnInit {
  authenticationUserStoreService = inject(AuthenticationUserStoreService);
  authenticationAccountService = inject(AuthenticationAccountService);
  dialogServiceUtil = inject(DialogServiceUtil);
  dialog = inject(MatDialog);

  userDataSignal = this.authenticationUserStoreService.state.getUserData;
  userSignal = this.authenticationUserStoreService.state.getUser;
  userImageControl = new FormControl<string | null>(null);

  accountDescription = accountDescription;
  actionButtonTooltips = actionButtonTooltips;

  accountTypeSignal = computed(() => {
    const isCash = this.userDataSignal().features.userPortfolioAllowCashAccount;
    return isCash ? AccountTypes.Trading : AccountTypes.Basic;
  });

  accountDescriptionSignal = computed(() => {
    return this.accountDescription[this.accountTypeSignal()];
  });

  ngOnInit(): void {
    // set user image into the form control
    const userData = this.authenticationUserStoreService.state().userData;
    this.userImageControl.setValue(userData?.personal.photoURL ?? null);
  }

  @Confirmable('Are you sure you want to delete your account?')
  onDeleteAccount(): void {
    from(this.authenticationAccountService.userDeleteAccount()).pipe(
      tap(() => this.dialogServiceUtil.showNotificationBar('Your account has been deleted')),
      catchError((err) => {
        this.dialogServiceUtil.handleError(err);
        return EMPTY;
      }),
    );
  }

  onChangePassword(): void {}

  onChangeDisplayName(): void {}

  @Confirmable('Are you sure you want to reset your account? Your trading history will be removed')
  onResetTransactions(): void {
    this.dialogServiceUtil.showNotificationBar('Sending request to reset your account');
    from(this.authenticationAccountService.userResetTransactions())
      .pipe(
        tap(() => this.dialogServiceUtil.showNotificationBar('Your account has been reset')),
        catchError((err) => {
          this.dialogServiceUtil.handleError(err);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
