import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { GroupApiService } from '@market-monitor/api-client';
import { GROUP_OWNER_LIMIT, GroupData } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import {
  GroupCreateDialogComponent,
  GroupDisplayCardComponent,
  GroupSearchControlComponent,
} from '@market-monitor/modules/group/features';
import { GroupDisplayItemComponent } from '@market-monitor/modules/group/ui';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { UploadImageSingleControlComponent } from '@market-monitor/shared/features/upload-image-single-control';
import { GeneralCardComponent, RangeDirective, SectionTitleComponent } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-page-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    GroupCreateDialogComponent,
    MatDialogModule,
    UploadImageSingleControlComponent,
    MatTooltipModule,
    GroupDisplayCardComponent,
    GroupDisplayItemComponent,
    GeneralCardComponent,
    GroupSearchControlComponent,
    ReactiveFormsModule,
    SectionTitleComponent,
    RangeDirective,
  ],
  templateUrl: './page-groups.component.html',
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageGroupsComponent {
  authenticationUserService = inject(AuthenticationUserStoreService);
  groupApiService = inject(GroupApiService);
  dialogServiceUtil = inject(DialogServiceUtil);
  dialog = inject(MatDialog);
  router = inject(Router);
  groupsSignal = this.authenticationUserService.state.userGroupData;
  searchGroupControl = new FormControl<GroupData | null>(null);

  isCreateGroupDisabledSignal = computed(
    () => this.authenticationUserService.state.getUserData().groups.groupOwner.length >= GROUP_OWNER_LIMIT,
  );

  get errorMessageGroupCreate(): string {
    return `You can only create ${GROUP_OWNER_LIMIT} groups`;
  }

  constructor() {
    this.searchGroupControl.valueChanges.subscribe((d) => {
      this.router.navigate(['groups', d?.id]);
    });
  }

  onCreateGroupClick(): void {
    this.dialog.open(GroupCreateDialogComponent, {
      data: {},
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  /**
   * user clicks on received group invitation
   */
  async onReceivedInvitationClick(groupData: GroupData) {
    const response = await this.dialogServiceUtil.showActionButtonDialog({
      dialogTitle: `Do you want to accept or decline the invitation from ${groupData.name}?`,
      primaryButtonText: 'Accept',
      secondaryButtonText: 'Decline',
      secondaryButtonColor: 'warn',
    });
    const user = this.authenticationUserService.state.getUserData();

    try {
      // accept user
      if (response === 'primary') {
        this.dialogServiceUtil.showNotificationBar(`Accepting group ${groupData.name} invitation`);
        await this.groupApiService.userAcceptsGroupInvitation(groupData.id);
        this.dialogServiceUtil.showNotificationBar(`Accepted ${groupData.name} invitation`, 'success');
      }

      // decline user
      else if (response === 'secondary') {
        this.dialogServiceUtil.showNotificationBar(`Declining group ${groupData.name} invitation}`);
        await this.groupApiService.userDeclinesGroupInvitation({
          userId: user.id,
          groupId: groupData.id,
        });
        this.dialogServiceUtil.showNotificationBar(`Declined ${groupData.name} invitation`, 'success');
      }
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  /**
   * user clicks on his own sent request to join a group
   */
  async onSentRequestClick(groupData: GroupData) {
    const response = await this.dialogServiceUtil.showActionButtonDialog({
      dialogTitle: `Do you want to remove your request from from ${groupData.name}?`,
      primaryButtonText: 'Remove',
    });

    try {
      // remove request
      if (response === 'primary') {
        this.dialogServiceUtil.showNotificationBar(`Removing request from group ${groupData.name}`);
        await this.groupApiService.removeRequestToJoinGroup({
          groupId: groupData.id,
          userId: this.authenticationUserService.state.getUserData().id,
        });
        this.dialogServiceUtil.showNotificationBar(`Removed request from group ${groupData.name}`, 'success');
      }
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  onGroupClick(group: GroupData): void {
    this.router.navigate(['groups', group.id]);
  }

  async onAcceptInvitationClick(group: GroupData) {
    try {
      this.dialogServiceUtil.showNotificationBar('Accepting invitation', 'notification');
      await this.groupApiService.userAcceptsGroupInvitation(group.id);
      this.dialogServiceUtil.showNotificationBar('Invitation accepted', 'success');
    } catch (e) {
      this.dialogServiceUtil.handleError(e);
    }
  }

  @Confirmable('Are you sure you want to decline this invitation?')
  async onDeclineInvitationClick(group: GroupData) {
    console.log('decline', group);
    try {
      this.dialogServiceUtil.showNotificationBar('Declining invitation', 'notification');
      await this.groupApiService.userDeclinesGroupInvitation({
        groupId: group.id,
        userId: this.authenticationUserService.state.getUserData().id,
      });
      this.dialogServiceUtil.showNotificationBar('Invitation declined', 'success');
    } catch (e) {
      this.dialogServiceUtil.handleError(e);
    }
  }
}
