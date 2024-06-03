import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { accountDescription } from '@mm/api-types';
import { ChangePasswordDialogComponent } from '@mm/authentication/authentication-forms';
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { UserAccountTypeDirective } from '@mm/authentication/feature-access-directive';
import { IS_DEV_TOKEN, ROUTES_MAIN } from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { ThemeSwitcherComponent } from '@mm/shared/theme-switcher';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';
import { UploadFileControlComponent } from 'libs/shared/features/upload-file-control/src';
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
    UploadFileControlComponent,
    ReactiveFormsModule,
    MatTooltipModule,
    UserAccountTypeSelectDialogComponent,
    ChangePasswordDialogComponent,
    UserAccountTypeDirective,
    ThemeSwitcherComponent,
  ],
  template: `
    <app-dialog-close-header title="Settings"></app-dialog-close-header>

    <mat-dialog-content class="xs:px-6 flex min-h-[350px] flex-col gap-y-6 px-1 lg:flex-row">
      <div class="border-wt-border flex-1 md:border-r">
        <div class="flex flex-col gap-6 sm:flex-row">
          <!-- user image -->
          <div class="max-md:mx-auto">
            <app-upload-file-control
              folder="users"
              [isDisabled]="isDemoAccount()"
              [fileName]="userDataSignal().id"
              [heightPx]="225"
              [formControl]="userImageControl"
            />
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
        <div class="hidden p-4 lg:block">
          <div class="text-wt-primary mb-2 text-lg">{{ userDataSignal().userAccountType }} - Account</div>
          <div *ngFor="let text of accountDescriptionSignal()" class="mb-3">
            {{ text }}
          </div>
        </div>
      </div>

      <!-- action buttons -->
      <div class="flex min-w-[180px] flex-col gap-y-3 lg:pl-6">
        <!--  Change Account type -->
        <button
          [disabled]="isDemoAccount() && !isDevActive"
          (click)="onChangeInitials()"
          type="button"
          mat-stroked-button
          color="primary"
        >
          Change Initials
        </button>
        <!--  Change Display Name -->
        <button
          [disabled]="!isDevActive"
          (click)="onChangeDisplayName()"
          type="button"
          mat-stroked-button
          color="accent"
        >
          Change Display Name
        </button>
        <!--  Change Account type -->
        <button
          [disabled]="isDemoAccount() && !isDevActive"
          (click)="onChangeAccountType()"
          type="button"
          mat-stroked-button
          color="primary"
        >
          Change Account type
        </button>
        <!--  Change Password -->
        <button
          *ngIf="userDataSignal().personal.providerId === 'password'"
          [disabled]="!isDevActive"
          (click)="onChangePassword()"
          type="button"
          mat-stroked-button
          color="warn"
        >
          Change Password
        </button>

        <div class="mb-4 mt-10 hidden lg:block">
          <mat-divider></mat-divider>
        </div>

        <!--  Reset Transactions -->
        <button
          [disabled]="!isDevActive"
          (click)="onResetTransactions()"
          [matTooltip]="actionButtonTooltips.resetTransactions"
          type="button"
          mat-flat-button
          color="primary"
        >
          Reset Transactions
        </button>
        <!--  Delete Account -->
        <button
          [disabled]="!isDevActive"
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
      <div class="g-mat-dialog-actions-end xs:px-6 px-1">
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
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<UserSettingsDialogComponent>);
  isDevActive = inject(IS_DEV_TOKEN, {
    optional: true,
  });

  isDemoAccount = signal(true); // this.authenticationUserStoreService.state.isDemoAccount;
  userDataSignal = this.authenticationUserStoreService.state.getUserData;
  userSignal = this.authenticationUserStoreService.state.getUser;
  userImageControl = new FormControl<string | null>(null);

  accountDescription = accountDescription;

  actionButtonTooltips = {
    deleteAccount: `Account will be deleted permanently and you will be logged out from the application. This action cannot be undone.`,
    resetTransactions: `Use this action to delete your trading history. You will start as a new user with a clean portfolio.`,
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
    this.dialogServiceUtil.showNotificationBar('Your account has been deleted', 'success');

    // sign out to avoid errors
    this.authenticationAccountService.signOut();

    // close dialog
    this.dialogRef.close();

    // redirect to home
    this.router.navigate([ROUTES_MAIN.LOGIN]);

    // perform delete account
    this.authenticationAccountService.deleteAccount();
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
        validatorMaxLength: 15,
        initialValue: this.userDataSignal().personal.displayName,
      })
      .pipe(
        take(1),
        filterNil(),
        map((val) =>
          this.authenticationUserStoreService.changeUserPersonal({
            displayName: val,
            displayNameLowercase: val.toLowerCase(),
          }),
        ),
        tap(() => this.dialogServiceUtil.showNotificationBar('Your display name has been changed', 'success')),
      )
      .subscribe((res) => console.log(res));
  }

  onChangeInitials(): void {
    this.dialogServiceUtil
      .showInlineInputDialog({
        title: 'Change Initials',
        description: 'Enter a new initials (custom identification - max 8 characters)',
        validatorMaxLength: 8,
        initialValue: this.userDataSignal().personal.displayNameInitials,
      })
      .pipe(
        take(1),
        filterNil(),
        map((val) =>
          this.authenticationUserStoreService.changeUserPersonal({
            displayNameInitials: val,
          }),
        ),
        tap(() =>
          this.dialogServiceUtil.showNotificationBar(
            'Your initials has been updated, may take some time to update everywhere',
            'success',
          ),
        ),
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
