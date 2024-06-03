import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupApiService } from '@mm/api-client';
import { GROUP_MEMBER_LIMIT, GROUP_OWNER_LIMIT, GroupCreateInput, UserData } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { maxLengthValidator, minLengthValidator, requiredValidator } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import {
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
  HideAfterDirective,
} from '@mm/shared/ui';
import { UserSearchControlComponent } from '@mm/user/features';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'market-monitor-group-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormMatInputWrapperComponent,
    MatCheckboxModule,
    DefaultImgDirective,
    MatProgressSpinnerModule,
    DialogCloseHeaderComponent,
    UserSearchControlComponent,
    UserDisplayItemComponent,
    HideAfterDirective,
  ],
  template: `
    <app-dialog-close-header [showCloseButton]="false" title="Create Group" />
    <!-- form -->
    <form [formGroup]="form" (ngSubmit)="onFormSubmit()">
      <mat-dialog-content>
        @if (!loaderSignal()) {
          @if (allowCreateGroup()) {
            <div class="grid gap-4">
              <!-- additional forms -->
              <div class="w-full lg:w-9/12">
                <!-- group name -->
                <app-form-mat-input-wrapper
                  data-testid="group-create-group-name-control"
                  formControlName="groupName"
                  inputCaption="Group Name"
                  inputType="TEXT"
                />

                <!-- is public -->
                <mat-checkbox
                  data-testid="group-create-is-public-checkbox"
                  color="primary"
                  formControlName="isPublic"
                  matTooltip="If selected people can request be member of a group"
                >
                  Is Group Public
                </mat-checkbox>

                <!-- add owner as member -->
                <mat-checkbox
                  data-testid="group-create-add-owner-checkbox"
                  color="primary"
                  formControlName="isOwnerMember"
                  matTooltip="If selected the owner will be added as a member of the group"
                >
                  Add owner as member
                </mat-checkbox>

                <!-- owner -->
                @if (form.controls.isOwnerMember.value) {
                  <div class="mt-2 flex gap-4 rounded-md p-4 shadow-md">
                    <app-user-display-item
                      data-testid="group-create-owner-as-member"
                      [userData]="authenticatedUserDataSignal()"
                    />
                  </div>
                }
              </div>
            </div>
          }

          <!-- display how many groups can be created -->
          @if (allowCreateGroup()) {
            <div
              *hideAfter="5000; let counter = counter"
              class="bg-wt-gray-light-strong mx-auto my-4 rounded-md p-4 text-center lg:w-11/12"
            >
              You are limited to create only {{ createGroupLimitSignal() }} groups. If you want to create more groups
              please contact support. Hidden after {{ counter() }} seconds.
            </div>
          } @else {
            <!-- error message if can not create more groups -->
            <div
              data-testid="group-create-not-allowed-message"
              class="bg-wt-danger mx-auto my-4 rounded-md p-4 text-center text-white lg:w-11/12"
            >
              You can not longer create any additional groups. If you want to create more groups please contact support.
            </div>
          }

          @if (allowCreateGroup()) {
            <!-- invite member -->
            <div class="my-8 space-x-2 text-lg">
              <span>Invite People</span>
              <span>{{ selectedUsersSignal().length }} / {{ memberLimitSignal() }}</span>
            </div>

            <!-- search user control -->
            <div class="mb-8 max-w-[450px]">
              <app-user-search-control (selectedUserEmitter)="onUserSelect($event)" />
            </div>

            <!-- display selected users -->
            <div class="grid gap-4 lg:grid-cols-2">
              @for (user of selectedUsersSignal(); track user.id) {
                <div class="flex justify-between gap-4 rounded-md p-4 shadow-md">
                  <app-user-display-item data-testid="group-create-selected-users" [userData]="user" />
                  <!-- remove user -->
                  <button
                    data-testid="group-create-selected-users-remove"
                    mat-icon-button
                    type="button"
                    matTooltip="Remove User"
                    (click)="onUserRemove(user)"
                  >
                    <mat-icon color="warn">delete</mat-icon>
                  </button>
                </div>
              }
            </div>
          }
        } @else {
          <!-- loader -->
          <div class="grid place-content-center gap-5 py-16">
            <mat-spinner [diameter]="100" class="m-auto" />
            <div class="text-wt-gray-medium text-center">This may time a while. Please wait...</div>
          </div>
        }
      </mat-dialog-content>

      @if (!loaderSignal()) {
        <div class="my-4">
          <mat-divider />
        </div>

        <mat-dialog-actions>
          <div class="g-mat-dialog-actions-end">
            <button mat-flat-button mat-dialog-close type="button">Cancel</button>
            <button
              data-testid="group-create-submit-button"
              type="submit"
              mat-flat-button
              color="primary"
              [disabled]="!allowCreateGroup()"
            >
              Save
            </button>
          </div>
        </mat-dialog-actions>
      }
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreateDialogComponent {
  private dialogRef = inject(MatDialogRef<GroupCreateDialogComponent>);
  private authenticationUserService = inject(AuthenticationUserStoreService);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private groupApiService = inject(GroupApiService);

  form = new FormGroup({
    groupName: new FormControl('', {
      validators: [requiredValidator, minLengthValidator(4), maxLengthValidator(20)],
      nonNullable: true,
    }),
    isPublic: new FormControl(true, { nonNullable: true }),
    isOwnerMember: new FormControl(true, { nonNullable: true }),
  });

  selectedUsersSignal = signal<UserData[]>([]);
  loaderSignal = signal<boolean>(false);

  /**
   * Limit of members that can be added to a group
   */
  memberLimitSignal = toSignal(
    this.form.controls.isOwnerMember.valueChanges.pipe(
      startWith(this.form.controls.isOwnerMember.value),
      map((isSelected) => (isSelected ? GROUP_MEMBER_LIMIT - 1 : GROUP_MEMBER_LIMIT)),
    ),
    { initialValue: GROUP_MEMBER_LIMIT },
  );

  createGroupLimitSignal = computed(
    () =>
      GROUP_OWNER_LIMIT -
      (this.authenticationUserService.state.userGroupData()?.groupOwner.filter((d) => !d.isClosed).length ?? 0),
  );

  allowCreateGroup = computed(() => this.createGroupLimitSignal() > 0);

  authenticatedUserDataSignal = this.authenticationUserService.state.getUserData;

  async onFormSubmit() {
    if (!this.allowCreateGroup()) {
      this.dialogServiceUtil.showNotificationBar(`You can only create ${GROUP_OWNER_LIMIT} groups`, 'error');
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill out all required fields', 'error');
      return;
    }

    // check if at least one user is added
    if (this.selectedUsersSignal().length === 0 && !this.form.controls.isOwnerMember.value) {
      this.dialogServiceUtil.showNotificationBar('Please add at least one user', 'error');
      return;
    }

    const value: GroupCreateInput = {
      groupName: this.form.controls.groupName.value,
      isPublic: this.form.controls.isPublic.value,
      isOwnerMember: this.form.controls.isOwnerMember.value,
      memberInvitedUserIds: this.selectedUsersSignal().map((d) => d.id),
      imageUrl: null,
    };

    // show loader
    this.loaderSignal.set(true);

    // send data to API
    try {
      await this.groupApiService.createGroup(value);

      this.dialogRef.close();
      this.dialogServiceUtil.showNotificationBar('Group has been created', 'success');
    } catch (e) {
      this.loaderSignal.set(false);
      this.dialogServiceUtil.handleError(e);
    }
  }

  onUserSelect(selectedUser: UserData): void {
    // prevent adding myself as a member
    if (selectedUser.id === this.authenticationUserService.state.getUserData().id) {
      this.dialogServiceUtil.showNotificationBar(
        'You cannot add invite yourself. Check the above checkbox for it',
        'error',
      );
      return;
    }

    // check limit
    if (this.selectedUsersSignal().length >= this.memberLimitSignal()) {
      this.dialogServiceUtil.showNotificationBar(`You can only add up to ${this.memberLimitSignal()} users`, 'error');
      return;
    }

    // check if user is already added
    const userIds = this.selectedUsersSignal().map((d) => d.id);

    // add user if not already added
    if (!userIds.includes(selectedUser.id)) {
      this.selectedUsersSignal.update((previous) => [...previous, selectedUser]);
    }
  }

  onUserRemove(userData: UserData): void {
    this.selectedUsersSignal.update((previous) => previous.filter((d) => d.id !== userData.id));
  }
}
