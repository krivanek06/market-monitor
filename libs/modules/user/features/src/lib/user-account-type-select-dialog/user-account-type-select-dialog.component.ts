import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserAccountBasicTypes, UserAccountEnum, accountDescription } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { Confirmable, DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-user-account-type-select-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule, DialogCloseHeaderComponent],
  template: `
    <app-dialog-close-header title="Available Account Types" />
    <mat-dialog-content class="p-4">
      <div class="mb-10 grid gap-x-10 gap-y-4 md:grid-cols-2">
        <!-- basic account -->
        <div
          class="rounded-lg border p-3"
          (click)="changeAccount(UserAccountTypes.NORMAL_BASIC)"
          [ngClass]="{
            'border-wt-primary pointer-events-none border-2':
              userData().userAccountType === UserAccountTypes.NORMAL_BASIC,
            'g-clickable-hover bg-wt-gray-light-strong opacity-85 hover:bg-transparent hover:opacity-100':
              userData().userAccountType !== UserAccountTypes.NORMAL_BASIC,
          }"
        >
          <div class="text-wt-primary mb-2 text-center text-lg">Basic Account</div>
          <div *ngFor="let text of accountDescription.NORMAL_BASIC" class="mb-3 text-center">
            {{ text }}
          </div>
        </div>

        <!-- trading account -->
        <div
          (click)="changeAccount(UserAccountTypes.DEMO_TRADING)"
          class="rounded-lg border p-3"
          [ngClass]="{
            'border-wt-primary pointer-events-none border-2':
              userData().userAccountType === UserAccountTypes.DEMO_TRADING,
            'g-clickable-hover bg-wt-gray-light-strong opacity-85 hover:bg-transparent hover:opacity-100':
              userData().userAccountType !== UserAccountTypes.DEMO_TRADING,
          }"
        >
          <div class="text-wt-primary mb-2 text-center text-lg">Demo Trading</div>
          <div *ngFor="let text of accountDescription.DEMO_TRADING" class="mb-3 text-center">
            {{ text }}
          </div>
        </div>
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
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);

  readonly userData = this.authenticationUserStoreService.state.getUserData;

  readonly accountDescription = accountDescription;
  readonly UserAccountTypes = UserAccountEnum;

  @Confirmable('Are you sure you want to reset your account? Your trading history & groups will be removed')
  changeAccount(selected: UserAccountBasicTypes) {
    // notify user
    this.dialogServiceUtil.showNotificationBar('Changing account type, please wait...');

    // check if user converting to basic account and is owner of groups
    if (selected === UserAccountEnum.NORMAL_BASIC && this.userData().groups.groupOwner.length > 0) {
      this.dialogServiceUtil.showNotificationBar(
        'You are owner of one or more groups. You cannot change to basic account type. First delete groups where you are the owner',
        'error',
        6000,
      );
      return;
    }

    // perform operation
    this.authenticationUserStoreService.changeAccountType(selected);

    // notify user
    this.dialogServiceUtil.showNotificationBar('Your account has been changed and reset', 'success');
  }
}
