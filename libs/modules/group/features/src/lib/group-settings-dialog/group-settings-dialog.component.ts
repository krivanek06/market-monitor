import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupApiService } from '@mm/api-client';
import { GroupMember } from '@mm/api-types';
import { maxLengthValidator, minLengthValidator, requiredValidator } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import {
  ArrayExcludePipe,
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
} from '@mm/shared/ui';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { UploadFileControlComponent } from 'libs/shared/features/upload-file-control/src';
import { filterNil } from 'ngxtension/filter-nil';
import { map, take } from 'rxjs';

export type GroupSettingsDialogComponentData = {
  groupId: string;
};

@Component({
  selector: 'app-group-settings-dialog',
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
    DialogCloseHeaderComponent,
    UserDisplayItemComponent,
    UploadFileControlComponent,
    ArrayExcludePipe,
  ],
  template: `
    <app-dialog-close-header [showCloseButton]="false" [title]="'Group Settings: ' + groupDataSignal()?.name" />
    <!-- form -->
    <form [formGroup]="form" (ngSubmit)="onFormSubmit()">
      <mat-dialog-content>
        <div class="flex gap-4">
          <!-- upload image -->
          <div>
            <app-upload-file-control
              folder="groups"
              formControlName="uploadedImage"
              (uploadedFilesEmitter)="onNewImageUpload($event)"
              [fileName]="groupDataSignal()?.id"
            />
          </div>

          <!-- additional forms -->
          <div class="flex-1">
            <!-- group name -->
            <app-form-mat-input-wrapper formControlName="groupName" inputCaption="Group Name" inputType="TEXT" />

            <!-- is public -->
            <mat-checkbox
              color="primary"
              formControlName="isPublic"
              matTooltip="If selected people can request be member of a group"
            >
              Is Group Public
            </mat-checkbox>
          </div>
        </div>

        @if (removingGroupMembers().length > 0) {
          <!-- removing member -->
          <div class="mb-4 mt-8 space-x-2 text-lg">
            <span>Remove Members</span>
          </div>

          <!-- display selected users -->
          <div class="grid gap-x-6 gap-y-2 md:grid-cols-2">
            <div *ngFor="let user of removingGroupMembers()" class="flex gap-4 p-4 shadow-md">
              <app-user-display-item [userData]="user" />
              <button mat-icon-button type="button" matTooltip="Remove User" (click)="onAddUserBack(user)">
                <mat-icon color="primary">add</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- current members -->
        <div class="mb-4 mt-8 space-x-2 text-lg">
          <span>Current Members</span>
        </div>

        <!-- display selected users -->
        <div class="grid gap-x-6 gap-y-2 md:grid-cols-2">
          <div
            *ngFor="let user of groupMembersSignal() | arrayExclude: removingGroupMembers() : 'id'"
            class="flex gap-4 p-4 shadow-md"
          >
            <app-user-display-item [userData]="user" />
            <button mat-icon-button type="button" matTooltip="Remove User" (click)="onUserRemove(user)">
              <mat-icon color="warn">delete</mat-icon>
            </button>
          </div>
        </div>
      </mat-dialog-content>

      <div class="my-4">
        <mat-divider></mat-divider>
      </div>

      <mat-dialog-actions>
        <div class="g-mat-dialog-actions-end">
          <button type="button" mat-flat-button mat-dialog-close>Cancel</button>
          <button type="submit" mat-flat-button color="primary">Save</button>
        </div>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupSettingsDialogComponent {
  private dialogRef = inject(MatDialogRef<GroupSettingsDialogComponent>);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private groupApiService = inject(GroupApiService);
  readonly data = inject<GroupSettingsDialogComponentData>(MAT_DIALOG_DATA);

  readonly form = new FormGroup({
    groupName: new FormControl('', {
      validators: [requiredValidator, minLengthValidator(4), maxLengthValidator(28)],
      nonNullable: true,
    }),
    isPublic: new FormControl(true, { nonNullable: true }),
    uploadedImage: new FormControl<string | null>(null),
  });

  readonly groupDataSignal = toSignal(this.groupApiService.getGroupDataById(this.data.groupId));
  readonly groupMembersSignal = toSignal(
    this.groupApiService.getGroupMembersDataById(this.data.groupId).pipe(map((d) => d?.data ?? [])),
    {
      initialValue: [],
    },
  );

  /**
   * save users that will be removed from the group
   */
  readonly removingGroupMembers = signal<GroupMember[]>([]);

  constructor() {
    this.initForm();
  }

  onUserRemove(groupMember: GroupMember) {
    this.removingGroupMembers.update((prev) => [...prev, groupMember]);
  }

  onAddUserBack(groupMember: GroupMember) {
    this.removingGroupMembers.update((prev) => prev.filter((member) => member.id !== groupMember.id));
  }

  async onNewImageUpload(imageUrl: string) {
    const group = this.groupDataSignal();

    if (!group) {
      return;
    }

    // send new image url to the server
    this.groupApiService.changeGroupSettings({
      groupId: group.id,
      groupName: group.name,
      isPublic: group.isPublic,
      imageUrl: imageUrl,
    });
  }

  async onFormSubmit() {
    this.form.markAllAsTouched();

    // form is invalid
    if (this.form.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill out all required fields', 'error');
      return;
    }

    // notify that people will be removed from the group
    if (this.removingGroupMembers().length > 0) {
      const message = `Confirm to remove ${this.removingGroupMembers().length} users`;
      if (!(await this.dialogServiceUtil.showConfirmDialog(message))) {
        return;
      }
    }

    try {
      // update group settings
      this.groupApiService.changeGroupSettings({
        groupId: this.data.groupId,
        groupName: this.form.controls.groupName.value,
        isPublic: this.form.controls.isPublic.value,
        imageUrl: this.form.controls.uploadedImage.value,
      });

      // remove members if any
      const removingUserIds = this.removingGroupMembers().map((user) => user.id);
      if (removingUserIds.length > 0) {
        this.groupApiService.removeGroupMembers({
          groupId: this.data.groupId,
          userIds: removingUserIds,
        });
      }

      this.dialogServiceUtil.showNotificationBar('Group settings updated', 'success');
      this.dialogRef.close();
    } catch (e) {
      this.dialogServiceUtil.handleError(e);
    }
  }

  private initForm(): void {
    // load groups data into the form once
    this.groupApiService
      .getGroupDataById(this.data.groupId)
      .pipe(filterNil(), take(1))
      .subscribe((groupData) => {
        this.form.patchValue({
          groupName: groupData.name,
          isPublic: groupData.isPublic,
          uploadedImage: groupData.imageUrl,
        });
      });
  }
}
