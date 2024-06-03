import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { GroupApiService } from '@mm/api-client';
import { GroupDetails, UserData } from '@mm/api-types';
import { Confirmable, DialogServiceUtil } from '@mm/shared/dialog-manager';
import { GeneralCardComponent } from '@mm/shared/ui';
import { UserDisplayItemComponent } from '@mm/user/ui';
@Component({
  selector: 'app-group-invitations-manager',
  standalone: true,
  imports: [CommonModule, GeneralCardComponent, UserDisplayItemComponent, MatRippleModule],
  template: `
    <app-general-card *ngIf="memberRequestUsers().length > 0 || memberInvitedUsers().length > 0" title="Invitations">
      <div class="grid min-h-[150px] w-full gap-8 p-2">
        <!-- received invitations -->
        <div *ngIf="memberRequestUsers().length > 0">
          <div class="mb-4 text-lg">Received Invitations</div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <div
              *ngFor="let user of memberRequestUsers()"
              (click)="onReceivedInvitationClick(user)"
              matRipple
              [matRippleCentered]="true"
              [matRippleDisabled]="false"
              [matRippleUnbounded]="false"
              appearance="outlined"
              class="border-wt-gray-light-strong g-clickable-hover cursor-pointer rounded-lg border p-2"
            >
              <app-user-display-item [userData]="user" />
            </div>
          </div>
        </div>

        <!-- sent invitations -->
        <div *ngIf="memberInvitedUsers().length > 0">
          <div class="mb-4 text-lg">Sent Invitations</div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <div
              *ngFor="let user of memberInvitedUsers()"
              (click)="onSentInvitationClick(user)"
              matRipple
              [matRippleCentered]="true"
              [matRippleDisabled]="false"
              [matRippleUnbounded]="false"
              appearance="outlined"
              class="border-wt-gray-light-strong g-clickable-hover-color border p-2"
            >
              <app-user-display-item [userData]="user" />
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
  groupData = input.required<GroupDetails>();
  memberRequestUsers = input.required<UserData[]>();
  memberInvitedUsers = input.required<UserData[]>();

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
          groupId: this.groupData().groupData.id,
        });
        this.dialogServiceUtil.showNotificationBar(`Accepted ${user.personal.displayName} to join`, 'success');
      }

      // decline user
      else if (response === 'secondary') {
        this.dialogServiceUtil.showNotificationBar(`Declining ${user.personal.displayName} to join the group`);
        await this.groupApiService.declineUserRequestToGroup({
          userId: user.id,
          groupId: this.groupData().groupData.id,
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
        groupId: this.groupData().groupData.id,
        userId: user.id,
      });

      // notify user
      this.dialogServiceUtil.showNotificationBar(`Removed ${user.personal.displayName} invitation to join`, 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }
}
