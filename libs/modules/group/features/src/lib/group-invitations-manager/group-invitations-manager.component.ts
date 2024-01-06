import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { GroupApiService } from '@market-monitor/api-client';
import { GroupDetails, UserData } from '@market-monitor/api-types';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { Confirmable, DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';
import { GeneralCardComponent } from '@market-monitor/shared/ui';
@Component({
  selector: 'app-group-invitations-manager',
  standalone: true,
  imports: [CommonModule, GeneralCardComponent, UserDisplayItemComponent, MatRippleModule],
  template: `
    <app-general-card *ngIf="memberRequestUsers.length > 0 || memberInvitedUsers.length > 0" title="Invitations">
      <div class="w-full min-h-[150px] p-2 grid gap-8">
        <!-- received invitations -->
        <div *ngIf="memberRequestUsers.length > 0">
          <div class="mb-4 text-lg">Received Invitations</div>
          <div class="flex flex-wrap gap-4">
            <div
              *ngFor="let user of memberRequestUsers"
              (click)="onReceivedInvitationClick(user)"
              matRipple
              [matRippleCentered]="true"
              [matRippleDisabled]="false"
              [matRippleUnbounded]="false"
              appearance="outlined"
              class="p-2 border rounded-lg cursor-pointer border-wt-gray-light-strong g-clickable-hover"
            >
              <app-user-display-item [userData]="user"></app-user-display-item>
            </div>
          </div>
        </div>

        <!-- sent invitations -->
        <div *ngIf="memberInvitedUsers.length > 0">
          <div class="mb-4 text-lg">Sent Invitations</div>
          <div class="flex flex-wrap gap-4">
            <div
              *ngFor="let user of memberInvitedUsers"
              (click)="onSentInvitationClick(user)"
              matRipple
              [matRippleCentered]="true"
              [matRippleDisabled]="false"
              [matRippleUnbounded]="false"
              appearance="outlined"
              class="p-2 border rounded-lg cursor-pointer border-wt-gray-light-strong g-clickable-hover"
            >
              <app-user-display-item [userData]="user"></app-user-display-item>
            </div>
          </div>
        </div>
      </div>
    </app-general-card>
  `,
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupInvitationsManagerComponent {
  @Input({ required: true }) groupData!: GroupDetails;
  @Input({ required: true }) memberRequestUsers!: UserData[];
  @Input({ required: true }) memberInvitedUsers!: UserData[];

  groupApiService = inject(GroupApiService);
  dialogServiceUtil = inject(DialogServiceUtil);

  async onReceivedInvitationClick(user: UserData): Promise<void> {
    console.log('onReceivedInvitationClick');
    const response = await this.dialogServiceUtil.showActionButtonDialog({
      dialogTitle: `Please decide if you want to accept or not the user ${user.personal.displayName}`,
      primaryButtonText: 'Accept',
      primaryButtonColor: 'primary',
      secondaryButtonText: 'Decline',
      secondaryButtonColor: 'warn',
    });

    // accept user
    try {
      if (response === 'primary') {
        this.dialogServiceUtil.showNotificationBar(`Accepting ${user.personal.displayName} to join the group`);
        await this.groupApiService.acceptUserRequestToGroup({
          userId: user.id,
          groupId: this.groupData.groupData.id,
        });
        this.dialogServiceUtil.showNotificationBar(`Accepted ${user.personal.displayName} to join`, 'success');
      }

      // decline user
      else if (response === 'secondary') {
        this.dialogServiceUtil.showNotificationBar(`Declining ${user.personal.displayName} to join the group`);
        await this.groupApiService.declineUserRequestToGroup({
          userId: user.id,
          groupId: this.groupData.groupData.id,
        });
        this.dialogServiceUtil.showNotificationBar(`Declined ${user.personal.displayName} to join`, 'success');
      }
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
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
