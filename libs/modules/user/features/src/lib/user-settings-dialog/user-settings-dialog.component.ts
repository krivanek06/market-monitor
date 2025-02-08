import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { GroupApiService } from '@mm/api-client';
import { accountDescription } from '@mm/api-types';
import { ChangePasswordDialogComponent } from '@mm/authentication/authentication-forms';
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { UserAccountTypeDirective } from '@mm/authentication/feature-access-directive';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { IS_DEV_TOKEN, ROUTES_MAIN } from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { ThemeSwitcherComponent } from '@mm/shared/theme-switcher';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';
import { UploadFileControlComponent } from '@mm/shared/upload-file-control';
import { filterNil } from 'ngxtension/filter-nil';
import { UserAccountTypeSelectDialogComponent } from '../user-account-type-select-dialog/user-account-type-select-dialog.component';

@Component({
  selector: 'app-user-settings-dialog',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    DialogCloseHeaderComponent,
    MatDividerModule,
    UploadFileControlComponent,
    ReactiveFormsModule,
    MatTooltipModule,
    UserAccountTypeDirective,
    ThemeSwitcherComponent,
    DatePipe,
    CurrencyPipe,
  ],
  template: `
    <app-dialog-close-header title="Settings" />

    <mat-dialog-content class="xs:px-6 flex min-h-[350px] flex-col gap-y-6 px-1 lg:flex-row">
      <div class="border-wt-border flex-1 lg:border-r lg:pr-10">
        <div class="flex flex-col gap-6 sm:flex-row">
          <!-- user image -->
          <div class="max-md:mx-auto">
            <app-upload-file-control
              folder="users"
              [isDisabled]="userDataNormal()?.isTest"
              [fileName]="userDataNormal()?.id ?? 'Unknown'"
              [heightPx]="170"
              [formControl]="userImageControl"
            />
          </div>

          <div class="flex-1">
            <!-- user data -->
            <div class="grid flex-1 gap-x-4 overflow-x-clip text-base lg:grid-cols-2 xl:text-lg">
              <!-- name -->
              <div class="g-item-wrapper">
                <span>Display Name:</span>
                <span>{{ userDataNormal()?.personal?.displayName }}</span>
              </div>
              <!-- initials -->
              <div class="g-item-wrapper">
                <span>Initials:</span>
                <span>{{ userDataNormal()?.personal?.displayNameInitials }}</span>
              </div>
              <!-- email -->
              <div class="g-item-wrapper">
                <span>Email:</span>
                <span>{{ userDataNormal()?.personal?.email }}</span>
              </div>
              <!-- created -->
              <div class="g-item-wrapper">
                <span>Created:</span>
                <span>{{ userDataNormal()?.accountCreatedDate | date: 'MMMM d, y' }}</span>
              </div>
              <!-- account type -->
              <div class="g-item-wrapper">
                <span>Account Type:</span>
                <span> {{ userDataNormal()?.userAccountType }}</span>
              </div>
              <!-- starting cash -->
              <div *appUserAccountType="'DEMO_TRADING'" class="g-item-wrapper border-wt-border border-b">
                <span>Starting Cash:</span>
                <span> {{ userDataNormal()?.portfolioState?.startingCash | currency }}</span>
              </div>
            </div>

            <!-- ID -->
            <div class="g-item-wrapper xs:flex-row flex-col overflow-x-clip max-sm:items-start">
              <span>AccountId:</span>
              <span> {{ userDataNormal()?.id }}</span>
            </div>

            <!-- theme -->
            <div class="g-item-wrapper overflow-x-clip">
              <span>Dark Mode:</span>
              <app-theme-switcher class="lg:-mr-4" />
            </div>
          </div>
        </div>

        <!-- explain account type -->
        <div class="hidden p-4 lg:block">
          <div class="text-wt-primary mb-2 text-lg">{{ userDataNormal()?.userAccountType }} - Account</div>
          @for (text of accountDescriptionSignal(); track $index) {
            <div class="mb-3">
              {{ text }}
            </div>
          }
        </div>
      </div>

      <!-- action buttons -->
      <div class="xs:grid-cols-2 grid min-w-[180px] gap-x-4 gap-y-3 md:grid-cols-3 md:gap-x-10 lg:grid-cols-1 lg:pl-6">
        <!--  Change Account type -->
        <button
          [disabled]="userDataNormal()?.isTest"
          (click)="onChangeInitials()"
          type="button"
          mat-stroked-button
          color="primary"
        >
          Change Initials
        </button>

        <!--  Change Display Name -->
        <button
          [disabled]="userDataNormal()?.isTest"
          (click)="onChangeDisplayName()"
          type="button"
          mat-stroked-button
          color="accent"
        >
          Change Display Name
        </button>

        <!--  Change Account type -->
        @if (isDevActive) {
          <button (click)="onChangeAccountType()" type="button" mat-stroked-button color="primary">
            Change Account type
          </button>
        }

        <!--  Change Password -->
        @if (userDataNormal()?.personal?.providerId === 'password') {
          <button
            [disabled]="userDataNormal()?.isTest"
            (click)="onChangePassword()"
            type="button"
            mat-stroked-button
            color="warn"
          >
            Change Password
          </button>
        }

        <div class="mb-4 mt-8 hidden lg:block">
          <mat-divider />
        </div>

        <!--  Reset Transactions -->
        <button
          [disabled]="userDataNormal()?.isTest || userDataNormal()?.isDemo"
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
          [disabled]="userDataNormal()?.isTest"
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
      <mat-divider />
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
      @apply h-10;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsDialogComponent implements OnInit {
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly authenticationAccountService = inject(AuthenticationAccountService);
  private readonly portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialog);
  private readonly groupApiService = inject(GroupApiService);

  readonly isDevActive = inject(IS_DEV_TOKEN, {
    optional: true,
  });

  /* use userDataNormal because this component get's destroyed as last one and before it is destroyed, use will be undefined - for deleting account */
  readonly userDataNormal = this.authenticationUserStoreService.state.getUserDataNormal;
  readonly userDataSignal = this.authenticationUserStoreService.state.getUserData;
  readonly userSignal = this.authenticationUserStoreService.state.getUser;
  readonly userImageControl = new FormControl<string | null>(null);

  readonly accountDescription = accountDescription;

  readonly actionButtonTooltips = {
    deleteAccount: `Account will be deleted permanently and you will be logged out from the application. This action cannot be undone.`,
    resetTransactions: `Use this action to delete your trading history. You will start as a new user with a clean portfolio.`,
  };

  readonly accountDescriptionSignal = computed(() => {
    const accountType = this.userDataSignal()?.userAccountType;
    if (!accountType) {
      return [];
    }
    return accountDescription[accountType];
  });

  ngOnInit(): void {
    // set user image into the form control
    const userData = this.authenticationUserStoreService.state().userData;
    this.userImageControl.setValue(userData?.personal.photoURL ?? null, { emitEvent: false });

    // update url
    this.userImageControl.valueChanges.pipe(filterNil()).subscribe((imgUrl) =>
      this.authenticationUserStoreService.updatePersonal({
        photoURL: imgUrl,
      }),
    );
  }

  @Confirmable('Are you sure you want to delete your account?', 'Confirm', true, 'DELETE')
  async onDeleteAccount() {
    // delete groups that user is owner
    const owner = this.authenticationUserStoreService.state.getUserData().groups.groupOwner;
    for (const group of owner) {
      this.groupApiService.deleteGroup(group);
    }

    // close dialog
    this.dialogRef.closeAll();

    // redirect to home
    await this.router.navigate([ROUTES_MAIN.LOGIN]);

    // perform delete account
    this.authenticationAccountService.deleteAccount();

    // notify user
    this.dialogServiceUtil.showNotificationBar('Your account has been deleted', 'success');

    // sign out to avoid errors
    this.authenticationAccountService.signOut();
  }

  onChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });
  }

  onChangeAccountType(): void {
    this.dialog.open(UserAccountTypeSelectDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  async onChangeDisplayName() {
    const displayName = await this.dialogServiceUtil.showInlineInputDialog({
      title: 'Change Display Name',
      description: 'Enter a new display name',
      validatorMaxLength: 15,
      initialValue: this.userDataSignal().personal.displayName,
    });

    if (!displayName) {
      return;
    }

    // update display name
    this.authenticationUserStoreService.updatePersonal({
      displayName: displayName,
      displayNameLowercase: displayName.toLowerCase(),
    });

    // notify user
    this.dialogServiceUtil.showNotificationBar('Your display name has been changed', 'success');
  }

  async onChangeInitials() {
    const initials = await this.dialogServiceUtil.showInlineInputDialog({
      title: 'Change Initials',
      description: 'Enter a new initials (custom identification - max 8 characters)',
      validatorMaxLength: 8,
      initialValue: this.userDataSignal().personal.displayNameInitials,
    });

    if (!initials) {
      return;
    }

    // update initials
    this.authenticationUserStoreService.updatePersonal({
      displayNameInitials: initials,
    });

    // notify user
    this.dialogServiceUtil.showNotificationBar(
      'Your initials has been updated, may take some time to update everywhere',
      'success',
    );
  }

  @Confirmable(
    'Confirm resetting your account. Your trading history & groups will be removed',
    'Confirm',
    true,
    'CONFIRM',
  )
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
    this.portfolioUserFacadeService.resetTransactions();

    // notify user
    this.dialogServiceUtil.showNotificationBar('Your account has been reset', 'success');
  }
}
