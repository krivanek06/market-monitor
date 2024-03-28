import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  DatePickerComponent,
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
  HideAfterDirective,
} from '@mm/shared/ui';
import { UploadImageSingleControlComponent } from '@mm/shared/upload-image-single-control';
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
    DatePickerComponent,
    DefaultImgDirective,
    MatProgressSpinnerModule,
    DialogCloseHeaderComponent,
    UserSearchControlComponent,
    UserDisplayItemComponent,
    UploadImageSingleControlComponent,
    HideAfterDirective,
  ],
  template: `
    <app-dialog-close-header [showCloseButton]="false" title="Create Group"></app-dialog-close-header>
    <!-- form -->
    <form [formGroup]="form" (ngSubmit)="onFormSubmit()">
      <mat-dialog-content *ngIf="!loaderSignal(); else showLoader">
        <div *ngIf="allowCreateGroup()" class="flex gap-4">
          <!-- upload image -->
          <div>
            <app-upload-image-single-control
              [heightPx]="250"
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

            <!-- add owner as member -->
            <app-form-mat-input-wrapper
              formControlName="isOwnerMember"
              inputCaption="Add owner as member"
              inputType="CHECKBOX"
              hintText="If selected the owner will be added as a member of the group"
            ></app-form-mat-input-wrapper>

            <!-- owner -->
            <div *ngIf="form.controls.isOwnerMember.value" class="flex gap-4 p-4 mt-2 shadow-md rounded-md">
              <app-user-display-item
                *ngIf="authenticatedUserDataSignal() as user"
                [userData]="user"
              ></app-user-display-item>
            </div>
          </div>
        </div>

        <!-- display how many groups can be created -->
        @if (allowCreateGroup()) {
          <div
            *hideAfter="5000; let counter = counter"
            class="p-4 mx-auto my-4 text-center rounded-md bg-wt-gray-light-strong lg:w-11/12"
          >
            You are limited to create only {{ createGroupLimitSignal() }} groups. If you want to create more groups
            please contact support. Hidden after {{ counter() }} seconds.
          </div>
        } @else {
          <!-- error message if can not create more groups -->
          <div class="p-4 mx-auto my-4 text-center rounded-md bg-wt-danger text-wt-gray-light lg:w-11/12">
            You can not longer create any additional groups. If you want to create more groups please contact support.
          </div>
        }

        <ng-container *ngIf="allowCreateGroup()">
          <!-- invite member -->
          <div class="my-8 space-x-2 text-lg">
            <span>Invite People</span>
            <span>{{ selectedUsersSignal().length }} / {{ memberLimitSignal() }}</span>
          </div>

          <!-- search user control -->
          <div class="max-w-[450px] mb-8">
            <app-user-search-control [formControl]="searchUserControl"></app-user-search-control>
          </div>

          <!-- display selected users -->
          <div class="flex flex-wrap gap-4">
            <div *ngFor="let user of selectedUsersSignal()" class="flex gap-4 p-4 shadow-md rounded-md">
              <app-user-display-item [userData]="user"></app-user-display-item>
              <button mat-icon-button type="button" matTooltip="Remove User" (click)="onUserRemove(user)">
                <mat-icon color="warn">delete</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>
      </mat-dialog-content>

      <div class="my-4">
        <mat-divider></mat-divider>
      </div>

      <mat-dialog-actions *ngIf="!loaderSignal()">
        <div class="g-mat-dialog-actions-end">
          <button mat-flat-button mat-dialog-close type="button">Cancel</button>
          <button type="submit" mat-flat-button color="primary" [disabled]="!allowCreateGroup()">Save</button>
        </div>
      </mat-dialog-actions>
    </form>

    <!-- loader -->
    <ng-template #showLoader>
      <div class="grid gap-5 py-16 place-content-center">
        <mat-spinner [diameter]="100" class="m-auto"></mat-spinner>
        <div class="text-center text-wt-gray-medium">This may time a while. Please wait...</div>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreateDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<GroupCreateDialogComponent>);
  private authenticationUserService = inject(AuthenticationUserStoreService);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private groupApiService = inject(GroupApiService);
  public data = inject<unknown>(MAT_DIALOG_DATA);

  form = new FormGroup({
    groupName: new FormControl('', {
      validators: [requiredValidator, minLengthValidator(4), maxLengthValidator(20)],
      nonNullable: true,
    }),
    isPublic: new FormControl(true, { nonNullable: true }),
    isOwnerMember: new FormControl(true, { nonNullable: true }),
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
    if (this.selectedUsersSignal().length === 0 && !this.form.controls.isOwnerMember.value) {
      this.dialogServiceUtil.showNotificationBar('Please add at least one user', 'error');
      return;
    }

    const value: GroupCreateInput = {
      groupName: this.form.controls.groupName.value,
      isPublic: this.form.controls.isPublic.value,
      isOwnerMember: this.form.controls.isOwnerMember.value,
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
