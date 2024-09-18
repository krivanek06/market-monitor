import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { GroupApiService } from '@mm/api-client';
import { GROUP_MEMBER_LIMIT, GroupDetails, UserData } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { UserSearchDialogComponent, UserSearchDialogData } from '@mm/user/features';
import { firstValueFrom } from 'rxjs';
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
  template: `
    @if (!groupDetails().groupData.isClosed) {
      <div class="flex w-full flex-col gap-x-4 gap-y-2 lg:flex-row">
        <!-- owner -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupOwner']"
          [disabled]="isDemoAccount()"
          (click)="onGroupCloseClick()"
          type="button"
          mat-stroked-button
          color="warn"
          [matTooltip]="tooltips.tooltipClose"
        >
          <mat-icon>close</mat-icon>
          Close Group
        </button>

        <!-- owner - reset data -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupOwner']"
          [disabled]="isDemoAccount()"
          (click)="onGroupResetData()"
          type="button"
          color="warn"
          mat-stroked-button
          [matTooltip]="tooltips.resetData"
        >
          <mat-icon>settings</mat-icon>
          Reset Data
        </button>

        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupOwner']; exclude: ['groupMember']"
          [disabled]="isDemoAccount()"
          (click)="onAddOwnerToGroupClick()"
          type="button"
          mat-stroked-button
          color="accent"
          [matTooltip]="tooltips.tooltipAddMyselfOwner"
        >
          <mat-icon>person</mat-icon>
          Add Myself To Group
        </button>

        <!-- member -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupMember']"
          [disabled]="isDemoAccount()"
          (click)="onLeaveGroupClick()"
          type="button"
          mat-stroked-button
          color="warn"
          [matTooltip]="tooltips.tooltipLeave"
        >
          <mat-icon>logout</mat-icon>
          Leave Group
        </button>

        <!-- invited person -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupInvitations']"
          [disabled]="isDemoAccount()"
          (click)="onDeclineInvitationClick()"
          type="button"
          mat-stroked-button
          color="warn"
          [matTooltip]="tooltips.tooltipInvitedCancel"
        >
          <mat-icon>logout</mat-icon>
          Decline Invitation
        </button>

        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupInvitations']"
          [disabled]="isDemoAccount()"
          (click)="onAcceptInvitationClick()"
          type="button"
          mat-stroked-button
          color="accent"
          [matTooltip]="tooltips.tooltipInvitedAccept"
        >
          <mat-icon>done</mat-icon>
          Accept Invitation
        </button>

        <!-- request invitation person -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupRequested']"
          [disabled]="isDemoAccount()"
          (click)="onCancelRequestClick()"
          type="button"
          mat-stroked-button
          color="warn"
          [matTooltip]="tooltips.tooltipDeclineRequest"
        >
          <mat-icon>logout</mat-icon>
          Decline Request
        </button>

        <!-- can join only public group -->
        @if (groupDetails().groupData.isPublic) {
          <button
            *appGroupUserHasRole="
              groupDetails().groupData.id;
              exclude: ['groupRequested', 'groupMember', 'groupInvitations', 'groupOwner']
            "
            [disabled]="isDemoAccount()"
            (click)="onRequestToJoinClick()"
            type="button"
            mat-stroked-button
            color="accent"
            [matTooltip]="tooltips.tooltipRequestToJoin"
          >
            <mat-icon>person</mat-icon>
            Send Request To Join
          </button>
        }

        <!-- owner - invite people -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupOwner']"
          [disabled]="isDemoAccount()"
          (click)="onInviteMembersClick()"
          type="button"
          mat-stroked-button
          color="primary"
          [matTooltip]="tooltips.tooltipInviteMembers"
        >
          <mat-icon>add</mat-icon>
          Invite Members
        </button>

        <!-- owner - settings -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupOwner']"
          [disabled]="isDemoAccount()"
          (click)="onGroupSettingsClick()"
          type="button"
          mat-stroked-button
        >
          <mat-icon>settings</mat-icon>
          Group Settings
        </button>
      </div>
    } @else {
      <!-- closed group -->
      <div class="flex flex-row gap-4">
        <!-- owner -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupOwner']"
          [disabled]="isDemoAccount()"
          (click)="onGroupDeleteClick()"
          type="button"
          mat-flat-button
          color="warn"
          [matTooltip]="tooltips.tooltipDelete"
        >
          <mat-icon>delete</mat-icon>
          Delete Group
        </button>

        <!-- owner -->
        <button
          *appGroupUserHasRole="groupDetails().groupData.id; include: ['groupOwner']"
          [disabled]="isDemoAccount()"
          (click)="onGroupReopenClick()"
          type="button"
          mat-stroked-button
          color="accent"
          [matTooltip]="tooltips.tooltipClose"
        >
          <mat-icon>cached</mat-icon>
          Reopen Group
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      gap: 16px;
    }

    button {
      @apply h-10;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupInteractionButtonsComponent {
  readonly groupDetails = input.required<GroupDetails>();

  readonly authenticationUserService = inject(AuthenticationUserStoreService);
  readonly groupApiService = inject(GroupApiService);
  readonly dialogServiceUtil = inject(DialogServiceUtil);

  readonly isDemoAccount = this.authenticationUserService.state.isDemoAccount;
  readonly userData = this.authenticationUserService.state.getUserData;
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly tooltips = {
    tooltipClose: `By closing a group, you will save its current state as a historical data and will not be able to make any changes to it.`,
    tooltipDelete: `By deleting a group, you will remove it from the system and will not be able to recover it.`,
    tooltipAddMyselfOwner: `As owner of the group, you can add yourself as member of the group if you are not part of it`,
    tooltipInviteMembers: `As owner of the group, you can invite members to join the group`,
    tooltipLeave: `By leaving a group, you will no longer be part of it`,
    tooltipInvitedCancel: `By cancelling an invitation, you will no longer be able to join the group`,
    tooltipInvitedAccept: `By accepting an invitation, you will be part of the group`,
    tooltipDeclineRequest: `By declining a request, you will remove your request to join the group`,
    tooltipRequestToJoin: `By requesting to join a group, you will be part of the group if the owner accepts your request`,
    resetData: `This action will reset portfolio growth and other historical data. Groups starts as fresh`,
  };

  onGroupSettingsClick() {
    this.dialog.open(GroupSettingsDialogComponent, {
      data: <GroupSettingsDialogComponentData>{
        groupId: this.groupDetails().groupData.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  @Confirmable('Are you sure you want to close this group?', 'Confirm', true, 'CLOSE')
  onGroupCloseClick() {
    try {
      this.groupApiService.closeGroup(this.groupDetails().groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You closed the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to reopen this group?')
  onGroupReopenClick() {
    try {
      this.groupApiService.reopenGroup(this.groupDetails().groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('The group has been reopened', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  onAddOwnerToGroupClick() {
    try {
      // add myself as owner
      this.groupApiService.addOwnerOfGroupIntoGroup(this.userData(), this.groupDetails().groupData);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You added yourself to the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  async onInviteMembersClick() {
    const allowedMembersToInvite =
      GROUP_MEMBER_LIMIT -
      this.groupDetails().groupData.memberUserIds.length -
      this.groupDetails().groupData.memberInvitedUserIds.length;

    const dialogRef = this.dialog.open<UserSearchDialogComponent, UserSearchDialogData, UserData[] | undefined>(
      UserSearchDialogComponent,
      {
        data: {
          title: 'Invite Members',
          multiple: true,
          selectUsersCap: allowedMembersToInvite,
        },
        disableClose: true,
        panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
      },
    );

    // wait for dialog to close
    const result = await firstValueFrom(dialogRef.afterClosed());

    // dismissed modal
    if (!result || result.length === 0) {
      return;
    }

    // invite users
    this.groupApiService.inviteUsersToGroup({
      groupId: this.groupDetails().groupData.id,
      userIds: result.map((u) => u.id),
    });

    // show notification
    this.dialogServiceUtil.showNotificationBar('Invitation sent', 'success');
  }

  @Confirmable('Are you sure you want to leave this group?')
  onLeaveGroupClick() {
    try {
      this.groupApiService.leaveGroup(this.groupDetails().groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You left the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to cancel this invitation?')
  onDeclineInvitationClick() {
    try {
      this.groupApiService.userDeclinesGroupInvitation({
        groupId: this.groupDetails().groupData.id,
        userId: this.authenticationUserService.state.getUserData().id,
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

      // accept invitation
      await this.groupApiService.userAcceptsGroupInvitation(this.groupDetails().groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You accepted the invitation', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to remove your request?')
  onCancelRequestClick() {
    try {
      this.groupApiService.declineUserRequestToGroup({
        groupId: this.groupDetails().groupData.id,
        userId: this.authenticationUserService.state.getUserData().id,
      });

      // show notification
      this.dialogServiceUtil.showNotificationBar('You removed your request', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  async onRequestToJoinClick() {
    try {
      // notify user
      this.dialogServiceUtil.showNotificationBar('Sending request to join group', 'notification');

      // send request to join group
      await this.groupApiService.sendRequestToJoinGroup(this.groupDetails().groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You sent a request to join the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to delete this group?')
  onGroupDeleteClick() {
    try {
      // send API call
      this.groupApiService.deleteGroup(this.groupDetails().groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('Group has been deleted', 'success');

      // redirect user to the groups page
      this.router.navigateByUrl(ROUTES_MAIN.GROUPS);
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('This action will reset portfolio growth and other historical data. Groups starts as fresh')
  onGroupResetData() {
    this.groupApiService.resetGroupData(this.groupDetails().groupData.id);

    // show notification
    this.dialogServiceUtil.showNotificationBar('Group data has been reset', 'success');
  }
}
