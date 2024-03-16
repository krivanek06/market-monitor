import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
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
import { UploadImageSingleControlComponent } from '@mm/shared/upload-image-single-control';
import { UserDisplayItemComponent } from '@mm/user/ui';
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
    UploadImageSingleControlComponent,
    ArrayExcludePipe,
  ],
  template: `
    <app-dialog-close-header
      [showCloseButton]="false"
      [title]="'Group Settings: ' + groupDataSignal()?.name"
    ></app-dialog-close-header>
    <!-- form -->
    <form [formGroup]="form" (ngSubmit)="onFormSubmit()">
      <mat-dialog-content>
        <div class="flex gap-4">
          <!-- upload image -->
          <div class="w-[270px] h-[270px]">
            <app-upload-image-single-control
              filePath="groups"
              formControlName="uploadedImage"
            ></app-upload-image-single-control>
          </div>

          <!-- additional forms -->
          <div class="flex-1">
            <!-- group name -->
            <app-form-mat-input-wrapper
              formControlName="groupName"
              inputCaption="Group Name"
              inputType="TEXT"
            ></app-form-mat-input-wrapper>

            <!-- is public -->
            <app-form-mat-input-wrapper
              formControlName="isPublic"
              inputCaption="Is Group Public"
              inputType="CHECKBOX"
              hintText="If selected people can request be member of a group"
            ></app-form-mat-input-wrapper>
          </div>
        </div>

        @if (removingGroupMembers().length > 0) {
          <!-- removing member -->
          <div class="mt-8 mb-4 space-x-2 text-lg">
            <span>Remove Members</span>
          </div>

          <!-- display selected users -->
          <div class="grid md:grid-cols-2 gap-x-6 gap-y-2">
            <div *ngFor="let user of removingGroupMembers()" class="flex gap-4 p-4 shadow-md">
              <app-user-display-item [userData]="user"></app-user-display-item>
              <button mat-icon-button type="button" matTooltip="Remove User" (click)="onAddUserBack(user)">
                <mat-icon color="primary">add</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- current members -->
        <div class="mt-8 mb-4 space-x-2 text-lg">
          <span>Current Members</span>
        </div>

        <!-- display selected users -->
        <div class="grid md:grid-cols-2 gap-x-6 gap-y-2">
          <div
            *ngFor="let user of groupMembersSignal() | arrayExclude: removingGroupMembers() : 'id'"
            class="flex gap-4 p-4 shadow-md"
          >
            <app-user-display-item [userData]="user"></app-user-display-item>
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
  form = new FormGroup({
    groupName: new FormControl('', {
      validators: [requiredValidator, minLengthValidator(4), maxLengthValidator(28)],
      nonNullable: true,
    }),
    isPublic: new FormControl(true, { nonNullable: true }),
    uploadedImage: new FormControl<string | null>(null),
  });

  groupDataSignal = toSignal(this.groupApiService.getGroupDataById(this.data.groupId));
  groupMembersSignal = toSignal(
    this.groupApiService.getGroupMembersDataById(this.data.groupId).pipe(map((d) => d?.data ?? [])),
    {
      initialValue: [],
    },
  );

  removingGroupMembers = signal<GroupMember[]>([]);

  constructor(
    private dialogRef: MatDialogRef<GroupSettingsDialogComponent>,
    private dialogServiceUtil: DialogServiceUtil,
    private groupApiService: GroupApiService,
    @Inject(MAT_DIALOG_DATA) public data: GroupSettingsDialogComponentData,
  ) {
    this.initForm();
  }

  onUserRemove(groupMember: GroupMember) {
    this.removingGroupMembers.update((prev) => [...prev, groupMember]);
  }

  onAddUserBack(groupMember: GroupMember) {
    this.removingGroupMembers.update((prev) => prev.filter((member) => member.id !== groupMember.id));
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
      if (
        !(await this.dialogServiceUtil.showConfirmDialog(
          `You will remove ${this.removingGroupMembers().length} users, please confirm`,
        ))
      ) {
        return;
      }
    }

    try {
      this.dialogServiceUtil.showNotificationBar('Updating group settings...', 'notification');
      await this.groupApiService.changeGroupSettings({
        groupId: this.data.groupId,
        groupName: this.form.controls.groupName.value,
        isPublic: this.form.controls.isPublic.value,
        imageUrl: this.form.controls.uploadedImage.value,
        removingUserIds: this.removingGroupMembers().map((d) => d.id),
      });
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
