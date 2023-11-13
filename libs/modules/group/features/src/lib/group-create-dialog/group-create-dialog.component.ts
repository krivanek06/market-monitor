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
import { UserData } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { UserSearchControlComponent } from '@market-monitor/modules/user/features';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
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
    groupName: new FormControl('', [requiredValidator, minLengthValidator(4), maxLengthValidator(28)]),
    isPublic: new FormControl(true),
    isMember: new FormControl(true),
  });

  searchUserControl = new FormControl<UserData | null>(null, { nonNullable: true });

  selectedUsersSignal = signal<UserData[]>([]);

  constructor(
    private dialogRef: MatDialogRef<GroupCreateDialogComponent>,
    private authenticationUserService: AuthenticationUserService,
    private dialogServiceUtil: DialogServiceUtil,
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

    if (this.selectedUsersSignal().length === 0) {
      this.dialogServiceUtil.showNotificationBar('Please add at least one user', 'error');
      return;
    }

    this.dialogServiceUtil.showNotificationBar('Group has been created', 'success');
  }

  private listenOnAddingUsers(): void {
    this.searchUserControl.valueChanges.subscribe((userData) => {
      if (!userData) {
        return;
      }

      // prevent adding myself
      if (userData.id === this.authenticationUserService.userData.id) {
        this.dialogServiceUtil.showNotificationBar(
          'You cannot add invite yourself. Check the above checkbox for it',
          'error',
        );
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
