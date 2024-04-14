import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { accountDescription } from '@mm/api-types';
import { ChangePasswordDialogComponent } from '@mm/authentication/authentication-forms';
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { UserAccountTypeDirective } from '@mm/authentication/feature-access-directive';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { createNameInitials } from '@mm/shared/general-util';
import { ThemeSwitcherComponent } from '@mm/shared/theme-switcher';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';
import { UploadImageSingleControlComponent } from '@mm/shared/upload-image-single-control';
import { filterNil } from 'ngxtension/filter-nil';
import { EMPTY, catchError, from, map, take, tap } from 'rxjs';
import { UserAccountTypeSelectDialogComponent } from '../user-account-type-select-dialog/user-account-type-select-dialog.component';

@Component({
  selector: 'app-user-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    DialogCloseHeaderComponent,
    MatDividerModule,
    UploadImageSingleControlComponent,
    ReactiveFormsModule,
    MatTooltipModule,
    UserAccountTypeSelectDialogComponent,
    ChangePasswordDialogComponent,
    UserAccountTypeDirective,
    ThemeSwitcherComponent,
  ],
  template: `
    <app-dialog-close-header title="Settings"></app-dialog-close-header>

    <mat-dialog-content class="min-h-[350px] flex flex-col lg:flex-row gap-y-6 px-1 xs:px-6">
      <div class="flex-1 md:border-r border-wt-border">
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- user image -->
          <div class="max-md:mx-auto">
            <app-upload-image-single-control
              filePath="users"
              [isDisabled]="isDemoAccount()"
              [fileName]="userDataSignal().id"
              [heightPx]="225"
              [formControl]="userImageControl"
            ></app-upload-image-single-control>
          </div>

          <!-- user data -->
          <div class="pt-2 text-lg">
            <!-- name -->
            <div class="c-text-item">
              <span>Display Name:</span>
              <span>{{ userDataSignal().personal.displayName }}</span>
            </div>
            <!-- initials -->
            <div class="c-text-item">
              <span>Initials:</span>
              <span>{{ userDataSignal().personal.displayNameInitials }}</span>
            </div>
            <!-- email -->
            <div class="c-text-item">
              <span>Email:</span>
              <span>{{ userSignal().email }}</span>
            </div>
            <!-- created -->
            <div class="c-text-item">
              <span>Created:</span>
              <span>{{ userDataSignal().accountCreatedDate | date: 'MMMM d, y' }}</span>
            </div>
            <!-- account type -->
            <div class="c-text-item">
              <span>Account Type:</span>
              <span> {{ userDataSignal().userAccountType }}</span>
            </div>
            <!-- starting cash -->
            <div *appUserAccountType="'DEMO_TRADING'" class="c-text-item">
              <span>Starting Cash:</span>
              <span> {{ userDataSignal().portfolioState.startingCash | currency }}</span>
            </div>
            <!-- theme -->
            <div class="flex items-center gap-6">
              <span class="text-wt-gray-dark">Dark Mode:</span>
              <app-theme-switcher />
            </div>
          </div>
        </div>

        <!-- explain account type -->
        <div class="p-4 hidden lg:block">
          <div class="mb-2 text-lg text-wt-primary">{{ userDataSignal().userAccountType }} - Account</div>
          <div *ngFor="let text of accountDescriptionSignal()" class="mb-3">
            {{ text }}
          </div>
        </div>
      </div>

      <!-- action buttons -->
      <div class="flex flex-col gap-y-2 min-w-[180px] lg:pl-6">
        <!--  Reset Transactions -->
        <button
          [disabled]="isDemoAccount()"
          (click)="onResetTransactions()"
          [matTooltip]="actionButtonTooltips.resetTransactions"
          type="button"
          mat-flat-button
          color="primary"
        >
          Reset Transactions
        </button>
        <!--  Change Display Name -->
        <button
          [disabled]="isDemoAccount()"
          (click)="onChangeDisplayName()"
          [matTooltip]="actionButtonTooltips.changeDisplayName"
          type="button"
          mat-stroked-button
          color="accent"
        >
          Change Display Name
        </button>
        <!--  Change Account type -->
        <button
          [disabled]="isDemoAccount()"
          (click)="onChangeAccountType()"
          [matTooltip]="actionButtonTooltips.changeAccountType"
          type="button"
          mat-stroked-button
          color="primary"
        >
          Change Account type
        </button>
        <!--  Change Password -->
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
        <!--  Delete Account -->
        <button
          [disabled]="isDemoAccount()"
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
      <div class="g-mat-dialog-actions-end px-1 xs:px-6">
        <button mat-flat-button mat-dialog-close type="button">Cancel</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
    }

    button {
      @apply h-11;
    }

    .c-text-item {
      display: flex;
      :first-child {
        min-width: 170px;
        color: var(--gray-dark);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsDialogComponent implements OnInit {
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private authenticationAccountService = inject(AuthenticationAccountService);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<UserSettingsDialogComponent>);

  isDemoAccount = this.authenticationUserStoreService.state.isDemoAccount;
  userDataSignal = this.authenticationUserStoreService.state.getUserData;
  userSignal = this.authenticationUserStoreService.state.getUser;
  userImageControl = new FormControl<string | null>(null);

  accountDescription = accountDescription;

  actionButtonTooltips = {
    deleteAccount: `Account will be deleted permanently and you will be logged out from the application. This action cannot be undone.`,
    changePassword: `A form will be displayed to you to change your password`,
    resetTransactions: `Use this action to delete your trading history. You will start as a new user with a clean portfolio.`,
    changeDisplayName: `Use this action to change your display name, this name will be visible to other users. Affect takes place in 24h.`,
    changeAccountType: `You will be presented with options to change your current account type between Basic and Trading`,
  };

  accountDescriptionSignal = computed(() => {
    return accountDescription[this.userDataSignal().userAccountType];
  });

  ngOnInit(): void {
    // set user image into the form control
    const userData = this.authenticationUserStoreService.state().userData;
    this.userImageControl.setValue(userData?.personal.photoURL ?? null, { emitEvent: false });

    // update url
    this.userImageControl.valueChanges.pipe(filterNil()).subscribe((imgUrl) =>
      this.authenticationUserStoreService.changeUserPersonal({
        photoURL: imgUrl,
      }),
    );
  }

  @Confirmable('Are you sure you want to delete your account?', 'Confirm', true, 'DELETE')
  onDeleteAccount(): void {
    // notify user
    this.dialogServiceUtil.showNotificationBar('Sending request to delete your account');

    // sign out to avoid errors
    this.authenticationAccountService.signOut();

    // perform delete account
    from(this.authenticationAccountService.deleteAccount()).pipe(
      tap(() => this.dialogServiceUtil.showNotificationBar('Your account has been deleted', 'success')),
      catchError((err) => {
        this.dialogServiceUtil.handleError(err);
        return EMPTY;
      }),
    );
  }

  onChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  onChangeAccountType(): void {
    this.dialog.open(UserAccountTypeSelectDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  onChangeDisplayName(): void {
    this.dialogServiceUtil
      .showInlineInputDialog({
        title: 'Change Display Name',
        description: 'Enter a new display name',
        initialValue: this.userDataSignal().personal.displayName,
      })
      .pipe(
        take(1),
        filterNil(),
        map((val) =>
          this.authenticationUserStoreService.changeUserPersonal({
            displayName: val,
            displayNameInitials: createNameInitials(val),
          }),
        ),
        tap(() => this.dialogServiceUtil.showNotificationBar('Your display name has been changed', 'success')),
      )
      .subscribe((res) => console.log(res));
  }

  @Confirmable('Are you sure you want to reset your account? Your trading history & groups will be removed')
  onResetTransactions(): void {
    // notify user
    this.dialogServiceUtil.showNotificationBar('Sending request to reset your account');
    const currentAccountType = this.authenticationUserStoreService.state.getUserData().userAccountType;

    // check account type
    if (currentAccountType !== 'DEMO_TRADING' && currentAccountType !== 'NORMAL_BASIC') {
      this.dialogServiceUtil.showNotificationBar('Account type not supported');
      return;
    }

    // perform operation
    from(this.authenticationUserStoreService.resetTransactions(currentAccountType))
      .pipe(
        take(1),
        tap(() => this.dialogServiceUtil.showNotificationBar('Your account has been reset', 'success')),
        catchError((err) => {
          this.dialogServiceUtil.handleError(err);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
