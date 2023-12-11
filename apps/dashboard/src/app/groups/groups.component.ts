import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { GroupApiService } from '@market-monitor/api-client';
import { GROUP_OWNER_LIMIT, GroupData } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import {
  GroupCreateDialogComponent,
  GroupDisplayCardComponent,
  GroupSearchControlComponent,
} from '@market-monitor/modules/group/features';
import { GroupDisplayItemComponent } from '@market-monitor/modules/group/ui';
import { UploadImageSingleControlComponent } from '@market-monitor/shared/features';
import { GeneralCardComponent, RangeDirective, SectionTitleComponent } from '@market-monitor/shared/ui';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';
import { map } from 'rxjs';

@Component({
  selector: 'app-groups',
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
  templateUrl: './groups.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent {
  authenticationUserService = inject(AuthenticationUserService);
  groupApiService = inject(GroupApiService);
  dialogServiceUtil = inject(DialogServiceUtil);
  dialog = inject(MatDialog);
  router = inject(Router);

  groupsSignal = toSignal(this.authenticationUserService.getUserGroupsData());
  searchGroupControl = new FormControl<GroupData | null>(null);

  isCreateGroupDisabledSignal = toSignal(
    this.authenticationUserService.getUserData().pipe(map((d) => d.groups.groupOwner.length >= GROUP_OWNER_LIMIT)),
  );

  get errorMessageGroupCreate(): string {
    return `You can only create ${GROUP_OWNER_LIMIT} groups`;
  }

  constructor() {
    this.authenticationUserService.getUserGroupsData().subscribe((data) => {
      console.log('HERE IS GROUP DATA');
      console.log(data);
    });

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
        userId: this.authenticationUserService.userData.id,
      });
      this.dialogServiceUtil.showNotificationBar('Invitation declined', 'success');
    } catch (e) {
      this.dialogServiceUtil.handleError(e);
    }
  }
}
