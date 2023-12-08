import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { GroupApiService } from '@market-monitor/api-client';
import { GroupDetails, UserData } from '@market-monitor/api-types';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { GeneralCardComponent } from '@market-monitor/shared/ui';
import { Confirmable, DialogServiceUtil } from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-group-invitations-manager',
  standalone: true,
  imports: [CommonModule, GeneralCardComponent, UserDisplayItemComponent, MatRippleModule],
  templateUrl: './group-invitations-manager.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupInvitationsManagerComponent {
  @Input({ required: true }) groupData!: GroupDetails;
  @Input({ required: true }) memberRequestUsers!: UserData[];
  @Input({ required: true }) memberInvitedUsers!: UserData[];

  groupApiService = inject(GroupApiService);
  dialogServiceUtil = inject(DialogServiceUtil);

  onReceivedInvitationClick(user: UserData): void {
    console.log('onReceivedInvitationClick');
    this.dialogServiceUtil.showActionButtonDialog({
      dialogTitle: `Please decide if you want to accept or not the user ${user.personal.displayName}`,
      primaryButtonText: 'Accept',
      primaryButtonColor: 'primary',
      secondaryButtonText: 'Decline',
      secondaryButtonColor: 'warn',
    });
  }

  @Confirmable('Do you want to remove this invitation? User will not be able to join the group anymore.')
  async onSentInvitationClick(user: UserData): Promise<void> {
    try {
      // notify user
      this.dialogServiceUtil.showNotificationBar(`Removing ${user.personal.displayName} invitation to join the group`);

      // remove invitation
      await this.groupApiService.removeUserInvitationToGroup({
        groupId: this.groupData.groupData.id,
        userId: user.id,
      });

      // notify user
      this.dialogServiceUtil.showNotificationBar(`Removed ${user.personal.displayName} invitation to join`, 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }
}
