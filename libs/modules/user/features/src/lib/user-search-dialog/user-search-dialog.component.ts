import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { UserData } from '@mm/api-types';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { Subject, map, merge, scan } from 'rxjs';
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
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    UserSearchControlComponent,
    ReactiveFormsModule,
    UserDisplayItemComponent,
    MatDividerModule,
  ],
  template: `
    <mat-dialog-content>
      <div class="text-wt-primary text-center text-xl">{{ dialogData().title }}</div>

      <!-- search user -->
      <div class="p-4">
        <app-user-search-control [formControl]="searchUserControl" />
      </div>

      <!-- display selected users -->
      @if (dialogData().multiple && selectedUsersSignal().length > 0) {
        <div class="flex items-center justify-between pt-2">
          <div class="my-4 space-x-1 text-lg">
            <span data-testid="user-search-dialog-selected-users-text">
              Selected Users: {{ selectedUsersSignal().length }}
            </span>

            @if (dialogData().selectUsersCap) {
              <span data-testid="user-search-dialog-selected-users-cap"> / {{ dialogData().selectUsersCap }} </span>
            }
          </div>

          <div>Remove User By Clicking</div>
        </div>
      }

      <!-- selected users -->
      <div class="grid grid-cols-1 gap-4">
        @for (user of selectedUsersSignal(); track user.id) {
          <div
            data-testid="user-search-dialog-item"
            class="border-wt-gray-medium g-clickable-hover border p-2"
            (click)="onUserRemove(user)"
          >
            <app-user-display-item [userData]="user" />
          </div>
        }
      </div>

      <!-- divider -->
      <div class="pt-6">
        <mat-divider />
      </div>
    </mat-dialog-content>

    <!-- actions -->
    <mat-dialog-actions>
      <div class="g-mat-dialog-actions-full mt-2">
        <button mat-flat-button mat-dialog-close type="button">Cancel</button>
        <button type="button" (click)="onCloseDialog()" mat-flat-button color="primary">Save</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSearchDialogComponent {
  private dialogServiceUtil = inject(DialogServiceUtil);
  private dialogRef = inject(MatDialogRef<UserSearchDialogComponent, UserData[] | undefined>);
  dialogData = signal(inject<UserSearchDialogData>(MAT_DIALOG_DATA));
  searchUserControl = new FormControl<UserData | null>(null);

  private removeUser$ = new Subject<UserData>();

  /**
   * subject about selected users
   */
  selectedUsersSignal = toSignal(
    merge(
      // emits the user who should be added
      this.searchUserControl.valueChanges.pipe(
        filterNil(),
        map((user) => ({
          action: 'add' as const,
          user,
        })),
      ),
      // emits the user who should be removed
      this.removeUser$.pipe(
        map((user) => ({
          action: 'remove' as const,
          user,
        })),
      ),
    ).pipe(
      scan((acc, curr) => {
        // remove user
        if (curr.action === 'remove') {
          return acc.filter((u) => u.id !== curr.user.id);
        }

        // check if multiple is enabled
        if (!this.dialogData().multiple) {
          return [curr.user];
        }

        // check if user already selected
        if (acc.find((u) => u.id === curr.user.id)) {
          this.dialogServiceUtil.showNotificationBar('User already selected', 'error');
          return acc;
        }

        // check if not overflowing with selected users number
        const selectUsersCap = this.dialogData().selectUsersCap;
        if (selectUsersCap && acc.length >= selectUsersCap) {
          this.dialogServiceUtil.showNotificationBar(`You can select up to ${selectUsersCap} users`, 'error');
          return acc;
        }

        return [...acc, curr.user];
      }, [] as UserData[]),
    ),
    { initialValue: [] },
  );

  onUserRemove(user: UserData) {
    this.removeUser$.next(user);
  }

  onCloseDialog() {
    this.dialogRef.close(this.selectedUsersSignal());
  }
}
