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
import { GroupApiService } from '@market-monitor/api-client';
import { GroupMember } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { UploadImageSingleControlComponent } from '@market-monitor/shared/features';
import {
  ArrayExcludePipe,
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
} from '@market-monitor/shared/ui';
import {
  DialogServiceModule,
  DialogServiceUtil,
  filterNullish,
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from '@market-monitor/shared/utils-client';
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
    DialogServiceModule,
    DialogCloseHeaderComponent,
    UserDisplayItemComponent,
    UploadImageSingleControlComponent,
    ArrayExcludePipe,
  ],
  templateUrl: './group-settings-dialog.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
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
    private authenticationUserService: AuthenticationUserService,
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
      .pipe(filterNullish(), take(1))
      .subscribe((groupData) => {
        this.form.patchValue({
          groupName: groupData.name,
          isPublic: groupData.isPublic,
          uploadedImage: groupData.imageUrl,
        });
      });
  }
}
