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
import { UploadImageSingleControlComponent } from '@market-monitor/shared/features';
import { GeneralCardComponent, RangeDirective, SectionTitleComponent } from '@market-monitor/shared/ui';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';

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
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageGroupsComponent {
  authenticationUserService = inject(AuthenticationUserStoreService);
  groupApiService = inject(GroupApiService);
  dialogServiceUtil = inject(DialogServiceUtil);
  dialog = inject(MatDialog);
  router = inject(Router);

  // groupsSignal = toSignal(this.authenticationUserService..getUserGroupsData());
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

  async onReceivedInvitationClick(group: GroupData) {
    const result = await this.dialogServiceUtil.showActionButtonDialog({
      dialogTitle: `Do you want to accept or decline the invitation from ${group.name}?`,
      primaryButtonText: 'Accept',
      secondaryButtonText: 'Decline',
      secondaryButtonColor: 'warn',
    });
    console.log('result', result);
  }

  async onSentRequestClick(group: GroupData) {
    const result = await this.dialogServiceUtil.showActionButtonDialog({
      dialogTitle: `Do you want to remove your request from from ${group.name}?`,
      primaryButtonText: 'Remove',
    });
    console.log('result', result);
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
