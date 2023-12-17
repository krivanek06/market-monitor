import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupApiService, UserApiService } from '@market-monitor/api-client';
import { GroupData, UserData } from '@market-monitor/api-types';
import {
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
import { DialogServiceUtil, filterNullish } from '@market-monitor/shared/utils-client';
import { forkJoin, share, switchMap, tap } from 'rxjs';

export type UserDetailsDialogComponentData = {
  userId: string;
};

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    DefaultImgDirective,
    MatProgressSpinnerModule,
    PortfolioStateComponent,
    PortfolioStateRiskComponent,
    PortfolioStateTransactionsComponent,
  ],
  templateUrl: './user-details-dialog.component.html',
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsDialogComponent {
  private userApiService = inject(UserApiService);
  private groupApiService = inject(GroupApiService);
  private dialogServiceUtil = inject(DialogServiceUtil);

  userDataSignal = signal<UserData | undefined>(undefined);
  userGroupDataSignal = signal<{
    groupOwner: GroupData[];
    groupMember: GroupData[];
  }>({
    groupMember: [],
    groupOwner: [],
  });

  ColorScheme = ColorScheme;

  constructor(
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailsDialogComponentData,
  ) {
    const userRef$ = this.userApiService.getUsersById(this.data.userId).pipe(
      tap((userData) => {
        if (!userData) {
          this.dialogServiceUtil.showNotificationBar(`User not found`, 'error');
          this.onDialogClose();
        }
      }),
      filterNullish(),
      share(),
    );

    // load user data
    userRef$.subscribe((userData) => {
      this.userDataSignal.set(userData);
    });

    // load user group data
    userRef$
      .pipe(
        switchMap((userData) =>
          forkJoin([
            this.groupApiService.getGroupDataByIds(userData.groups.groupOwner),
            this.groupApiService.getGroupDataByIds(userData.groups.groupMember),
          ]),
        ),
      )
      .subscribe(([groupOwner, groupMember]) =>
        this.userGroupDataSignal.set({
          groupMember,
          groupOwner,
        }),
      );
  }

  onDialogClose() {
    this.dialogRef.close();
  }
}
