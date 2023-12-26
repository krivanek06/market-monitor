import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupApiService } from '@market-monitor/api-client';
import { GROUP_MEMBER_LIMIT, GROUP_OWNER_LIMIT, GroupCreateInput, UserData } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { UserSearchControlComponent } from '@market-monitor/modules/user/features';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { UploadImageSingleControlComponent } from '@market-monitor/shared/features/upload-image-single-control';
import {
  DatePickerComponent,
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
  HideAfterDirective,
} from '@market-monitor/shared/ui';
import {
  DialogServiceModule,
  DialogServiceUtil,
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from '@market-monitor/shared/utils-client';
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
    DatePickerComponent,
    DefaultImgDirective,
    DialogServiceModule,
    MatProgressSpinnerModule,
    DialogCloseHeaderComponent,
    UserSearchControlComponent,
    UserDisplayItemComponent,
    UploadImageSingleControlComponent,
    HideAfterDirective,
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
    uploadedImage: new FormControl<string | null>(null),
  });

  searchUserControl = new FormControl<UserData | null>(null, { nonNullable: true });

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

  authenticatedUserDataSignal = this.authenticationUserService.state.userData;

  constructor(
    private dialogRef: MatDialogRef<GroupCreateDialogComponent>,
    private authenticationUserService: AuthenticationUserStoreService,
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
    if (this.selectedUsersSignal().length === 0) {
      this.dialogServiceUtil.showNotificationBar('Please add at least one user', 'error');
      return;
    }

    const value: GroupCreateInput = {
      groupName: this.form.controls.groupName.value,
      isPublic: this.form.controls.isPublic.value ?? false,
      isOwnerMember: this.form.controls.isOwnerMember.value ?? false,
      memberInvitedUserIds: this.selectedUsersSignal().map((d) => d.id),
      imageUrl: this.form.controls.uploadedImage.value ?? null,
    };

    // show loader
    this.loaderSignal.set(true);

    // send data to API
    this.groupApiService
      .createGroup(value)
      .then((d) => {
        console.log(d);
        this.dialogRef.close();
        this.dialogServiceUtil.showNotificationBar('Group has been created', 'success');
      })
      .catch((e) => {
        this.loaderSignal.set(false);
        this.dialogServiceUtil.handleError(e);
      });
  }

  private listenOnAddingUsers(): void {
    this.searchUserControl.valueChanges.subscribe((userData) => {
      if (!userData) {
        return;
      }

      // prevent adding myself as a member
      if (userData.id === this.authenticationUserService.state().userData!.id) {
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
      if (!userIds.includes(userData.id)) {
        this.selectedUsersSignal.update((previous) => [...previous, userData]);
      }
    });
  }
}
