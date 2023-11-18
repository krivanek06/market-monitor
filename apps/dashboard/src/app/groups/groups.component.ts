import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { GroupCreateDialogComponent } from '@market-monitor/modules/group/features';
import { UploadImageSingleControlComponent } from '@market-monitor/shared/features';
import { SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    GroupCreateDialogComponent,
    MatDialogModule,
    UploadImageSingleControlComponent,
  ],
  templateUrl: './groups.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent {
  authenticationUserService = inject(AuthenticationUserService);
  dialog = inject(MatDialog);

  onCreateGroupClick(): void {
    this.dialog.open(GroupCreateDialogComponent, {
      data: {},
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  constructor() {
    this.authenticationUserService.getUserGroupsData().subscribe((data) => {
      console.log('HERE IS GROUP DATA');
      console.log(data);
    });
  }
}
