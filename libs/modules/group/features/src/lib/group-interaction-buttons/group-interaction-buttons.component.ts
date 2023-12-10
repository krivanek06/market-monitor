import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupApiService } from '@market-monitor/api-client';
import { GROUP_MEMBER_LIMIT, GroupDetails, UserData } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { UserSearchDialogComponent, UserSearchDialogData } from '@market-monitor/modules/user/features';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS, filterNullish } from '@market-monitor/shared/utils-client';
import { EMPTY, catchError, filter, from, of, switchMap, take, tap } from 'rxjs';
import {
  GroupSettingsDialogComponent,
  GroupSettingsDialogComponentData,
} from '../group-settings-dialog/group-settings-dialog.component';
import { GroupUserHasRoleDirective } from '../group-user-role-directive/group-user-role.directive';

@Component({
  selector: 'app-group-interaction-buttons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    UserSearchDialogComponent,
    MatDialogModule,
    GroupUserHasRoleDirective,
    GroupSettingsDialogComponent,
  ],
  templateUrl: './group-interaction-buttons.component.html',
  styles: [
    `
      :host {
        display: flex;
        gap: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupInteractionButtonsComponent {
  @Input({ required: true }) groupDetails!: GroupDetails;

  authenticationUserService = inject(AuthenticationUserService);
  groupApiService = inject(GroupApiService);
  dialogServiceUtil = inject(DialogServiceUtil);
  dialog = inject(MatDialog);

  get tooltipClose(): string {
    return `By closing a group, you will save its current state as a historical data and will not be able to make any changes to it.`;
  }

  get tooltipAddMyselfOwner(): string {
    return `As owner of the group, you can add yourself as member of the group if you are not part of it`;
  }

  get tooltipInviteMembers(): string {
    return `As owner of the group, you can invite members to join the group`;
  }

  get tooltipLeave(): string {
    return `By leaving a group, you will no longer be part of it`;
  }

  get tooltipInvitedCancel(): string {
    return `By cancelling an invitation, you will no longer be able to join the group`;
  }

  get tooltipInvitedAccept(): string {
    return `By accepting an invitation, you will be part of the group`;
  }

  get tooltipDeclineRequest(): string {
    return `By declining a request, you will remove your request to join the group`;
  }

  get tooltipRequestToJoin(): string {
    return `By requesting to join a group, you will be part of the group if the owner accepts your request`;
  }

  onGroupSettingsClick() {
    this.dialog.open(GroupSettingsDialogComponent, {
      data: <GroupSettingsDialogComponentData>{
        groupId: this.groupDetails.groupData.id,
      },
    });
  }

  @Confirmable('Are you sure you want to close this group?')
  async onGroupCloseClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Closing group', 'notification');

      await this.groupApiService.closeGroup(this.groupDetails.groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You closed the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  async onAddOwnerToGroupClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Saving data and adding you to the group', 'notification');

      // add myself as owner
      await this.groupApiService.addOwnerOfGroupIntoGroup(this.groupDetails.groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You added yourself to the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  onInviteMembersClick() {
    const allowedMembersToInvite =
      GROUP_MEMBER_LIMIT -
      this.groupDetails.groupData.memberUserIds.length -
      this.groupDetails.groupData.memberInvitedUserIds.length;

    this.dialog
      .open(UserSearchDialogComponent, {
        data: <UserSearchDialogData>{
          title: 'Invite Members',
          multiple: true,
          selectUsersCap: allowedMembersToInvite,
        },
        panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
      })
      .afterClosed()
      .pipe(
        filterNullish(),
        filter((d: UserData[]) => d.length > 0),
        tap(() => this.dialogServiceUtil.showNotificationBar('Inviting members', 'notification')),
        switchMap((res) =>
          from(
            this.groupApiService.inviteUsersToGroup({
              groupId: this.groupDetails.groupData.id,
              userIds: res.map((u) => u.id),
            }),
          ),
        ),
        tap((res) => {
          if (res > 0) {
            this.dialogServiceUtil.showNotificationBar('Invitation sent', 'success');
          } else {
            this.dialogServiceUtil.showNotificationBar('No users were invited', 'notification');
          }
        }),
        take(1),
        catchError((error) => {
          this.dialogServiceUtil.handleError(error);
          return of(EMPTY);
        }),
      )
      .subscribe((res) => {
        console.log('closed with', res);
      });
  }

  @Confirmable('Are you sure you want to leave this group?')
  async onLeaveGroupClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Leaving group', 'notification');

      await this.groupApiService.removeGroupMember({
        groupId: this.groupDetails.groupData.id,
        userId: this.authenticationUserService.userData.id,
      });

      // show notification
      this.dialogServiceUtil.showNotificationBar('You left the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to cancel this invitation?')
  async onDeclineInvitationClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Cancelling invitation', 'notification');

      await this.groupApiService.userDeclinesGroupInvitation({
        groupId: this.groupDetails.groupData.id,
        userId: this.authenticationUserService.userData.id,
      });

      // show notification
      this.dialogServiceUtil.showNotificationBar('You cancelled the invitation', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  async onAcceptInvitationClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Accepting invitation', 'notification');

      await this.groupApiService.userAcceptsGroupInvitation(this.groupDetails.groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You accepted the invitation', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to remove your request?')
  async onCancelRequestClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Removing request', 'notification');

      await this.groupApiService.declineUserRequestToGroup({
        groupId: this.groupDetails.groupData.id,
        userId: this.authenticationUserService.userData.id,
      });

      // show notification
      this.dialogServiceUtil.showNotificationBar('You removed your request', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  async onRequestToJoinClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Sending request to join group', 'notification');

      await this.groupApiService.sendRequestToJoinGroup(this.groupDetails.groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You sent a request to join the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }
}
