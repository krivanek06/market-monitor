import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupApiService } from '@market-monitor/api-client';
import { GROUP_MEMBER_LIMIT, GroupCreateInput, UserData } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { UserSearchControlComponent } from '@market-monitor/modules/user/features';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { UploadImageSingleControlComponent, UploadedFile } from '@market-monitor/shared/features';
import {
  DatePickerComponent,
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
} from '@market-monitor/shared/ui';
import {
  DialogServiceModule,
  DialogServiceUtil,
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from '@market-monitor/shared/utils-client';

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
    DatePickerComponent,
    DefaultImgDirective,
    DialogServiceModule,
    MatProgressSpinnerModule,
    DialogCloseHeaderComponent,
    UserSearchControlComponent,
    UserDisplayItemComponent,
    UploadImageSingleControlComponent,
  ],
  templateUrl: './group-create-dialog.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreateDialogComponent implements OnInit {
  form = new FormGroup({
    groupName: new FormControl('', {
      validators: [requiredValidator, minLengthValidator(4), maxLengthValidator(28)],
      nonNullable: true,
    }),
    isPublic: new FormControl(true),
    isOwnerMember: new FormControl(true),
    uploadedImage: new FormControl<UploadedFile | null>(null),
  });

  searchUserControl = new FormControl<UserData | null>(null, { nonNullable: true });

  selectedUsersSignal = signal<UserData[]>([]);
  loaderSignal = signal<boolean>(false);

  constructor(
    private dialogRef: MatDialogRef<GroupCreateDialogComponent>,
    private authenticationUserService: AuthenticationUserService,
    private dialogServiceUtil: DialogServiceUtil,
    private groupApiService: GroupApiService,
    @Inject(MAT_DIALOG_DATA) public data: unknown,
  ) {}

  ngOnInit(): void {
    this.listenOnAddingUsers();
  }

  onUserRemove(userData: UserData): void {
    this.selectedUsersSignal.update((previous) => previous.filter((d) => d.id !== userData.id));
  }

  onFormSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill out all required fields', 'error');
      return;
    }

    // check if at least one user is added
    // if (this.selectedUsersSignal().length === 0) {
    //   this.dialogServiceUtil.showNotificationBar('Please add at least one user', 'error');
    //   return;
    // }

    const value: GroupCreateInput = {
      groupName: this.form.controls.groupName.value,
      isPublic: this.form.controls.isPublic.value ?? false,
      isOwnerMember: this.form.controls.isOwnerMember.value ?? false,
      memberInvitedUserIds: this.selectedUsersSignal().map((d) => d.id),
      imageUrl: this.form.controls.uploadedImage.value?.downloadURL ?? null,
    };

    // show loader
    this.loaderSignal.set(true);

    // send data to API
    this.groupApiService
      .createGroup(value)
      .then((d) => {
        console.log('THIS HAPPENED AFTER FUNCTION EXECUTION');
        console.log(d);

        this.dialogRef.close();
        this.dialogServiceUtil.showNotificationBar('Group has been created', 'success');
      })
      .catch((e) => {
        this.loaderSignal.set(false);
        this.dialogServiceUtil.showNotificationBar('Something went wrong', 'error');
      });
  }

  private listenOnAddingUsers(): void {
    this.searchUserControl.valueChanges.subscribe((userData) => {
      if (!userData) {
        return;
      }

      // prevent adding myself as a member
      if (userData.id === this.authenticationUserService.userData.id) {
        this.dialogServiceUtil.showNotificationBar(
          'You cannot add invite yourself. Check the above checkbox for it',
          'error',
        );
        return;
      }

      // check limit
      if (this.selectedUsersSignal().length >= GROUP_MEMBER_LIMIT) {
        this.dialogServiceUtil.showNotificationBar(`You can only add up to ${GROUP_MEMBER_LIMIT} users`, 'error');
        return;
      }

      // check if user is already added
      const userIds = this.selectedUsersSignal().map((d) => d.id);

      // add user if not already added
      if (!userIds.includes(userData.id)) {
        this.selectedUsersSignal.update((previous) => [...previous, userData]);
      }
    });
  }
}
