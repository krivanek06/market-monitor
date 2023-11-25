import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GroupApiService } from '@market-monitor/api-client';
import { GroupInteractionButtonsComponent } from '@market-monitor/modules/group/features';
import { map, switchMap } from 'rxjs';
import { GroupDetailsHoldingsComponent } from './group-details-holdings/group-details-holdings.component';
import { GroupDetailsOverviewComponent } from './group-details-overview/group-details-overview.component';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    GroupInteractionButtonsComponent,
    GroupDetailsOverviewComponent,
    GroupDetailsHoldingsComponent,
  ],
  templateUrl: './group-details.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsComponent {
  groupApiService = inject(GroupApiService);
  groupDetailsSignal = toSignal(
    inject(ActivatedRoute).params.pipe(
      map((d) => d['id']),
      switchMap((id) => this.groupApiService.getGroupDetailsById(id)),
    ),
  );

  constructor() {
    console.log('GroupDetailsComponent');
  }

  onSelectionChange(event: MatTabChangeEvent) {
    console.log(event);
  }
}
