import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { GroupApiService } from '@mm/api-client';
import { GROUP_OWNER_LIMIT, GroupData } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { GroupCreateDialogComponent, GroupDisplayCardComponent, GroupSearchControlComponent } from '@mm/group/features';
import { GroupDisplayItemComponent } from '@mm/group/ui';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { GeneralCardComponent, RangeDirective, SectionTitleComponent } from '@mm/shared/ui';
import { UploadImageSingleControlComponent } from '@mm/shared/upload-image-single-control';

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
  template: `
    <div class="grid m-auto xl:w-11/12 gap-y-4">
      <div class="flex flex-col lg:flex-row w-full lg:mb-6 items-center gap-x-8 gap-y-4">
        <div class="flex justify-between gap-x-10 max-lg:w-full">
          <!-- title -->
          <div class="flex items-center gap-3">
            <mat-icon color="primary">group</mat-icon>
            <span class="text-xl text-wt-primary">Groups</span>
          </div>

          <!-- create new group -->
          <div>
            <button
              [disabled]="isCreateGroupDisabledSignal()"
              mat-stroked-button
              type="button"
              color="primary"
              (click)="onCreateGroupClick()"
              class="h-10"
            >
              <mat-icon>add</mat-icon>
              create group
            </button>
          </div>
        </div>

        <!-- search groups -->
        <div class="flex flex-col justify-end gap-2 lg:flex-row flex-1 w-full">
          <app-group-search-control [formControl]="searchGroupControl" class="w-full lg:w-[500px] xl:w-[600px]" />
        </div>
      </div>

      @if (groupsSignal(); as groups) {
        <!-- invitations - sent / received -->
        <div
          *ngIf="groups.groupInvitations.length > 0 || groups.groupRequested.length > 0"
          class="grid lg:grid-cols-2 gap-x-6 gap-y-4 min-h-[100px] mb-6"
        >
          <!-- received invitations -->
          <app-general-card title="Received Invitations">
            @for (group of groups.groupInvitations; track group.id) {
              <div class="flex items-center gap-2">
                <app-group-display-item
                  [groupData]="group"
                  [clickable]="true"
                  (click)="onReceivedInvitationClick(group)"
                  class="flex-1"
                />
                <button
                  mat-icon-button
                  class="border-2 border-solid border-wt-gray-light-strong"
                  (click)="onGroupClick(group)"
                >
                  <mat-icon>navigate_next</mat-icon>
                </button>
              </div>
            }
          </app-general-card>
          <!-- sent invitations -->
          <app-general-card title="Sent Invitations">
            @for (group of groups.groupRequested; track group.id) {
              <div class="flex items-center gap-2">
                <app-group-display-item
                  [groupData]="group"
                  [clickable]="true"
                  (click)="onSentRequestClick(group)"
                  class="flex-1"
                />
                <button
                  mat-icon-button
                  class="border-2 border-solid border-wt-gray-light-strong"
                  (click)="onGroupClick(group)"
                >
                  <mat-icon>navigate_next</mat-icon>
                </button>
              </div>
            }
          </app-general-card>
        </div>

        <div
          *ngIf="groups.groupOwner.length === 0 && groups.groupMember.length === 0"
          class="text-2xl text-center text-wt-gray-medium mt-[250px]"
        >
          You are not a member of any group. You can create a new group or search for existing groups.
        </div>

        <!-- my groups -->
        <div *ngIf="groups.groupOwner.length > 0">
          <app-section-title title="My Groups" />
          <div class="flex flex-col gap-3">
            <app-group-display-card
              *ngFor="let group of groups.groupOwner"
              (groupClickEmitter)="onGroupClick(group)"
              [groupData]="group"
              [clickable]="true"
            ></app-group-display-card>
          </div>
        </div>

        <!-- member of -->
        <div *ngIf="groups.groupMember.length > 0">
          <app-section-title title="Member of" />
          <div class="flex flex-col gap-3">
            <app-group-display-card
              *ngFor="let group of groups.groupMember"
              (groupClickEmitter)="onGroupClick(group)"
              [groupData]="group"
              [clickable]="true"
            ></app-group-display-card>
          </div>
        </div>
      } @else {
        <!-- skeleton -->
        <div class="grid m-auto xl:w-11/12 gap-y-4">
          <div *ngRange="5" class="g-skeleton h-[200px] w-full mb-2"></div>
        </div>
      }
    </div>
  `,
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
    () =>
      (this.authenticationUserService.state.getUserDataNormal()?.groups?.groupOwner?.length ?? 99) >=
        GROUP_OWNER_LIMIT || this.authenticationUserService.state.isDemoAccount(),
  );

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
      secondaryButtonText: 'Cancel',
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
