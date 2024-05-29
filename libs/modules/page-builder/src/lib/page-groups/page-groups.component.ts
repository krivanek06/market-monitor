import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { GeneralCardComponent, RangeDirective, SectionTitleComponent, animationShowItemLeft } from '@mm/shared/ui';

@Component({
  selector: 'app-page-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    GroupCreateDialogComponent,
    MatDialogModule,
    MatTooltipModule,
    GroupDisplayCardComponent,
    GroupDisplayItemComponent,
    GeneralCardComponent,
    GroupSearchControlComponent,
    SectionTitleComponent,
    RangeDirective,
  ],
  template: `
    <div class="grid m-auto xl:w-11/12 gap-y-4">
      <div class="flex flex-col lg:flex-row w-full lg:mb-6 items-center gap-x-8 gap-y-4">
        <div class="flex justify-between gap-x-10 max-lg:w-full">
          <!-- title -->
          <app-section-title matIcon="group" title="Groups" class="mt-1" />

          <!-- create new group -->
          <div>
            <button
              [disabled]="isCreateGroupDisabledSignal()"
              mat-stroked-button
              data-testid="page-groups-create-group"
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
          <app-group-search-control (selectedEmitter)="onGroupClick($event)" class="w-full lg:w-[500px] xl:w-[600px]" />
        </div>
      </div>

      @if (groupsSignal(); as groups) {
        <!-- invitations - sent / received -->
        @if (groups.groupInvitations.length > 0 || groups.groupRequested.length > 0) {
          <div class="grid lg:grid-cols-2 gap-x-6 gap-y-4 min-h-[100px] mb-6">
            <!-- received invitations -->
            <app-general-card title="Received Invitations">
              @for (group of groups.groupInvitations; track group.id) {
                <div class="flex items-center gap-2">
                  <app-group-display-item
                    data-testid="page-groups-received-invitation"
                    [groupData]="group"
                    [clickable]="true"
                    (itemClicked)="onReceivedInvitationClick(group)"
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
                    data-testid="page-groups-sent-invitation"
                    [groupData]="group"
                    [clickable]="true"
                    (itemClicked)="onSentRequestClick(group)"
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
        }

        <!-- no group message -->
        @if (groups.groupOwner.length === 0 && groups.groupMember.length === 0) {
          <div class="text-2xl text-center text-wt-gray-medium mt-[250px]">
            You are not a member of any group. You can create a new group or search for existing groups.
          </div>
        }

        <!-- my groups -->
        @if (groups.groupOwner.length > 0) {
          <app-section-title title="My Groups" />
          <div @showItemLeft class="flex flex-col gap-3">
            @for (group of groups.groupOwner; track group.id) {
              <app-group-display-card
                data-testid="page-groups-my-groups"
                (itemClicked)="onGroupClick(group)"
                [groupData]="group"
                [clickable]="true"
              />
            }
          </div>
        }

        <!-- member of -->
        @if (groups.groupMember.length > 0) {
          <app-section-title title="Member of" />
          <div @showItemLeft class="flex flex-col gap-3">
            @for (group of groups.groupMember; track group.id) {
              <app-group-display-card
                data-testid="page-groups-member-of-groups"
                (itemClicked)="onGroupClick(group)"
                [groupData]="group"
                [clickable]="true"
              />
            }
          </div>
        }
      } @else {
        <!-- skeleton -->
        <div class="grid m-auto xl:w-11/12 gap-y-4">
          <div *ngRange="5" class="g-skeleton h-[200px] w-full mb-2"></div>
        </div>
      }
    </div>
  `,
  animations: [animationShowItemLeft],
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

  isCreateGroupDisabledSignal = computed(
    () =>
      (this.groupsSignal()?.groupOwner?.length ?? 99) >= GROUP_OWNER_LIMIT ||
      this.authenticationUserService.state.isDemoAccount(),
  );

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
        this.dialogServiceUtil.showNotificationBar(`Accepted ${groupData.name} invitation`, 'success');

        await this.groupApiService.userAcceptsGroupInvitation(groupData.id);
      }

      // decline user
      else if (response === 'secondary') {
        this.dialogServiceUtil.showNotificationBar(`Declined ${groupData.name} invitation`, 'success');

        await this.groupApiService.userDeclinesGroupInvitation({
          userId: user.id,
          groupId: groupData.id,
        });
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
        // show notification
        this.dialogServiceUtil.showNotificationBar(`Removed request from group ${groupData.name}`, 'success');

        // remove request
        await this.groupApiService.removeRequestToJoinGroup({
          groupId: groupData.id,
          userId: this.authenticationUserService.state.getUserData().id,
        });
      }
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  onGroupClick(group: GroupData): void {
    this.router.navigate(['groups', group.id]);
  }
}
