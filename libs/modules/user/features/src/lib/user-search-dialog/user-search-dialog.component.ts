import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { UserData } from '@market-monitor/api-types';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';
import { DialogCloseHeaderComponent } from '@market-monitor/shared/ui';
import { UserSearchControlComponent } from '../user-search-control/user-search-control.component';

export type UserSearchDialogData = {
  title: string;
  multiple?: boolean;

  /**
   * how many users can be selected if multiple is true
   */
  selectUsersCap?: number;
};

@Component({
  selector: 'app-user-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogCloseHeaderComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    UserSearchControlComponent,
    ReactiveFormsModule,
    UserDisplayItemComponent,
    MatDividerModule,
  ],
  templateUrl: './user-search-dialog.component.html',
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSearchDialogComponent {
  searchUserControl = new FormControl<UserData | null>(null, { nonNullable: true });
  selectedUsersSignal = signal<UserData[]>([]);

  dialogServiceUtil = inject(DialogServiceUtil);

  constructor(
    private dialogRef: MatDialogRef<UserSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserSearchDialogData,
  ) {
    this.listenOnSearchControl();
  }

  onUserRemove(user: UserData) {
    this.selectedUsersSignal.update((users) => users.filter((u) => u.id !== user.id));
  }

  onCloseDialog() {
    this.dialogRef.close(this.selectedUsersSignal());
  }

  private listenOnSearchControl() {
    this.searchUserControl.valueChanges.subscribe((value) => {
      if (value) {
        if (this.data.multiple) {
          // check if not overflowing with selected users number
          if (this.data.selectUsersCap && this.selectedUsersSignal().length >= this.data.selectUsersCap) {
            this.dialogServiceUtil.showNotificationBar(
              `You can select up to ${this.data.selectUsersCap} users`,
              'error',
            );
          } else {
            // check if user is already selected
            if (this.selectedUsersSignal().find((u) => u.id === value.id)) {
              this.dialogServiceUtil.showNotificationBar('User already selected', 'error');
              return;
            }
            this.selectedUsersSignal.update((users) => [...users, value]);
          }
        } else {
          // single selection, close dialog
          this.selectedUsersSignal.set([value]);
          this.onCloseDialog();
        }
      }
    });
  }
}
