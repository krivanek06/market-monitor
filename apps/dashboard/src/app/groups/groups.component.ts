import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { GROUP_OWNER_LIMIT, GroupData } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { GroupCreateDialogComponent } from '@market-monitor/modules/group/features';
import { GroupDisplayCardComponent } from '@market-monitor/modules/group/ui';
import { UploadImageSingleControlComponent } from '@market-monitor/shared/features';
import { SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';
import { map } from 'rxjs';

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
    MatTooltipModule,
    GroupDisplayCardComponent,
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
  router = inject(Router);

  groupsSignal = toSignal(this.authenticationUserService.getUserGroupsData());

  isCreateGroupDisabledSignal = toSignal(
    this.authenticationUserService.getUserData().pipe(map((d) => d.groups.groupOwner.length >= GROUP_OWNER_LIMIT)),
  );

  get errorMessageGroupCreate(): string {
    return `You can only create ${GROUP_OWNER_LIMIT} groups`;
  }

  onCreateGroupClick(): void {
    this.dialog.open(GroupCreateDialogComponent, {
      data: {},
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  onGroupClick(group: GroupData): void {
    console.log('GROUP CLICKED');
    console.log(group);
    this.router.navigate(['groups', group.id]);
  }

  constructor() {
    this.authenticationUserService.getUserGroupsData().subscribe((data) => {
      console.log('HERE IS GROUP DATA');
      console.log(data);
    });
  }
}
