import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { GroupApiService } from '@market-monitor/api-client';
import { GROUP_MEMBER_LIMIT, GroupDetails, UserData } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { UserSearchDialogComponent, UserSearchDialogData } from '@market-monitor/modules/user/features';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { filterNil } from 'ngxtension/filter-nil';
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
  template: `
    <ng-container *ngIf="!groupDetails.groupData.isClosed; else closedGroupActionButtons">
      <!-- owner -->
      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupOwner']"
        (click)="onGroupCloseClick()"
        type="button"
        mat-stroked-button
        color="warn"
        [matTooltip]="tooltipClose"
      >
        <mat-icon>close</mat-icon>
        Close Group
      </button>

      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupOwner']; exclude: ['groupMember']"
        (click)="onAddOwnerToGroupClick()"
        type="button"
        mat-stroked-button
        color="accent"
        [matTooltip]="tooltipAddMyselfOwner"
      >
        <mat-icon>person</mat-icon>
        Add Myself To Group
      </button>

      <!-- member -->
      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupMember']"
        (click)="onLeaveGroupClick()"
        type="button"
        mat-stroked-button
        color="warn"
        [matTooltip]="tooltipLeave"
      >
        <mat-icon>logout</mat-icon>
        Leave Group
      </button>

      <!-- invited person -->
      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupInvitations']"
        (click)="onDeclineInvitationClick()"
        type="button"
        mat-stroked-button
        color="warn"
        [matTooltip]="tooltipInvitedCancel"
      >
        <mat-icon>logout</mat-icon>
        Decline Invitation
      </button>

      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupInvitations']"
        (click)="onAcceptInvitationClick()"
        type="button"
        mat-stroked-button
        color="accent"
        [matTooltip]="tooltipInvitedAccept"
      >
        <mat-icon>done</mat-icon>
        Accept Invitation
      </button>

      <!-- request invitation person -->
      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupRequested']"
        (click)="onCancelRequestClick()"
        type="button"
        mat-stroked-button
        color="warn"
        [matTooltip]="tooltipDeclineRequest"
      >
        <mat-icon>logout</mat-icon>
        Decline Request
      </button>

      <button
        *appGroupUserHasRole="
          groupDetails.groupData.id;
          exclude: ['groupRequested', 'groupMember', 'groupInvitations', 'groupOwner']
        "
        (click)="onRequestToJoinClick()"
        type="button"
        mat-stroked-button
        color="accent"
        [matTooltip]="tooltipRequestToJoin"
      >
        <mat-icon>person</mat-icon>
        Send Request To Join
      </button>

      <!-- owner - invite people -->
      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupOwner']"
        (click)="onInviteMembersClick()"
        type="button"
        mat-stroked-button
        color="primary"
        [matTooltip]="tooltipInviteMembers"
      >
        <mat-icon>add</mat-icon>
        Invite Members
      </button>

      <!-- owner - settings -->
      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupOwner']"
        (click)="onGroupSettingsClick()"
        type="button"
        mat-stroked-button
      >
        <mat-icon>settings</mat-icon>
        Group Settings
      </button>
    </ng-container>

    <!-- closed group -->
    <ng-template #closedGroupActionButtons>
      <!-- owner -->
      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupOwner']"
        (click)="onGroupDeleteClick()"
        type="button"
        mat-flat-button
        color="warn"
        [matTooltip]="tooltipDelete"
      >
        <mat-icon>delete</mat-icon>
        Delete Group
      </button>

      <!-- owner -->
      <button
        *appGroupUserHasRole="groupDetails.groupData.id; include: ['groupOwner']"
        (click)="onGroupReopenClick()"
        type="button"
        mat-stroked-button
        color="accent"
        [matTooltip]="tooltipClose"
      >
        <mat-icon>cached</mat-icon>
        Reopen Group
      </button>
    </ng-template>
  `,
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

  authenticationUserService = inject(AuthenticationUserStoreService);
  groupApiService = inject(GroupApiService);
  dialogServiceUtil = inject(DialogServiceUtil);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  get tooltipClose(): string {
    return `By closing a group, you will save its current state as a historical data and will not be able to make any changes to it.`;
  }

  get tooltipDelete(): string {
    return `By deleting a group, you will remove it from the system and will not be able to recover it.`;
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

  @Confirmable('Are you sure you want to reopen this group?')
  async onGroupReopenClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Reopening group', 'notification');

      await this.groupApiService.reopenGroup(this.groupDetails.groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('The group has been reopened', 'success');
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
        filterNil(),
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
        userId: this.authenticationUserService.state.getUserData().id,
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
      // show notification
      this.dialogServiceUtil.showNotificationBar('Sending request to join group', 'notification');

      await this.groupApiService.sendRequestToJoinGroup(this.groupDetails.groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('You sent a request to join the group', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to delete this group?')
  async onGroupDeleteClick() {
    try {
      // show notification
      this.dialogServiceUtil.showNotificationBar('Deleting Group', 'notification');

      await this.groupApiService.deleteGroup(this.groupDetails.groupData.id);

      // show notification
      this.dialogServiceUtil.showNotificationBar('Group has been deleted', 'success');

      // redirect user to the groups page
      this.router.navigateByUrl(ROUTES_MAIN.GROUPS);
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }
}
