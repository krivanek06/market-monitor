import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { UserData } from '@mm/api-types';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';
import { UserDisplayItemComponent } from '@mm/user/ui';
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
  template: `
    <mat-dialog-content>
      <div class="text-xl text-center text-wt-primary">{{ data.title }}</div>

      <!-- search user -->
      <div class="p-4">
        <app-user-search-control [formControl]="searchUserControl"></app-user-search-control>
      </div>

      <!-- display selected users -->
      <ng-container *ngIf="data.multiple">
        <ng-container *ngIf="selectedUsersSignal() as selectedUsersSignal">
          <ng-container *ngIf="selectedUsersSignal.length > 0">
            <div class="flex items-center justify-between pt-2">
              <div class="my-4 space-x-1 text-lg">
                <span>Selected Users: {{ selectedUsersSignal.length }}</span>
                <span *ngIf="data.selectUsersCap">/ {{ data.selectUsersCap }}</span>
              </div>

              <div>Remove User By Clicking</div>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <div
                *ngFor="let user of selectedUsersSignal"
                class="p-2 border cursor-pointer border-wt-gray-medium hover:scale-105"
                (click)="onUserRemove(user)"
              >
                <app-user-display-item [userData]="user"></app-user-display-item>
              </div>
            </div>

            <!-- divider -->
            <div class="pt-6">
              <mat-divider></mat-divider>
            </div>
          </ng-container>
        </ng-container>
      </ng-container>
    </mat-dialog-content>

    <mat-dialog-actions *ngIf="data.multiple">
      <div class="mt-2 g-mat-dialog-actions-full">
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
