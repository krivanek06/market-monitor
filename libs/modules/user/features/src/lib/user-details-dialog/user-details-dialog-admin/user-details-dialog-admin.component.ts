import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { UserApiService } from '@mm/api-client';
import { UserData } from '@mm/api-types';
import { Confirmable, DialogServiceUtil } from '@mm/shared/dialog-manager';
import { SectionTitleComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-user-details-dialog-admin',
  imports: [MatButtonModule, SectionTitleComponent, MatDividerModule],
  standalone: true,
  template: `
    <div>
      <mat-divider />
    </div>

    <!-- display action buttons -->
    <div class="mb-2 p-4">
      <app-section-title title="Admin Actions" class="mb-3" />

      <!-- some data about the selected user -->
      <div class="g-item-wrapper mb-6">
        <div>UserID:</div>
        <div>{{ selectedUserData().id }}</div>
      </div>

      <div class="flex items-center gap-4">
        <button mat-stroked-button color="warn" (click)="onResetTransactionsByAdmin()">Reset Transactions</button>

        <button mat-stroked-button color="primary" (click)="onRecalculatePortfolioByAdmin()">
          Recalculate Portfolio Growth
        </button>

        <button mat-stroked-button color="primary" (click)="onRecalculatePortfolioStateByAdmin()">
          Recalculate Portfolio State
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsDialogAdminComponent {
  private readonly userApiService = inject(UserApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);

  readonly authUserData = input.required<UserData>();
  readonly selectedUserData = input.required<UserData>();

  @Confirmable('Are you sure you want to reset transactions?', 'Confirm', true, 'CONFIRM')
  async onResetTransactionsByAdmin() {
    if (!this.authUserData().isAdmin) {
      return;
    }

    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Resetting User Transactions', 'notification');

      // perform action
      await this.userApiService.fireAdminAction({
        type: 'adminResetUserTransactions',
        userId: this.selectedUserData().id,
      });

      // show notification
      this.dialogServiceUtil.showNotificationBar('User Transactions Reset Successfully', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to recalculate portfolio?', 'Confirm', true, 'CONFIRM')
  async onRecalculatePortfolioByAdmin() {
    if (!this.authUserData().isAdmin) {
      return;
    }

    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Recalculating portfolio growth', 'notification');

      // perform action
      await this.userApiService.fireAdminAction({
        type: 'adminRecalculateUserPortfolioGrowth',
        userId: this.selectedUserData().id,
      });

      // show notification
      this.dialogServiceUtil.showNotificationBar('Recalculated Successfully', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to recalculate portfolio state?', 'Confirm', true, 'CONFIRM')
  async onRecalculatePortfolioStateByAdmin() {
    if (!this.authUserData().isAdmin) {
      return;
    }

    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Recalculating portfolio growth', 'notification');

      // perform action
      await this.userApiService.fireAdminAction({
        type: 'adminRecalculatePortfolioState',
        userId: this.selectedUserData().id,
      });

      // show notification
      this.dialogServiceUtil.showNotificationBar('Recalculated Successfully', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }
}
