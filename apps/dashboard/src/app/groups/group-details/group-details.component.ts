import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { GroupApiService } from '@market-monitor/api-client';
import { GroupInteractionButtonsComponent } from '@market-monitor/modules/group/features';
import { LabelValue, SCREEN_LAYOUT } from '@market-monitor/shared/data-access';
import { TabSelectControlComponent } from '@market-monitor/shared/ui';
import { map, switchMap } from 'rxjs';
import { GroupDetailsHoldingsComponent } from './group-details-holdings/group-details-holdings.component';
import { GroupDetailsOverviewComponent } from './group-details-overview/group-details-overview.component';

type GroupDetailsTab = 'overview' | 'holdings';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [
    CommonModule,
    TabSelectControlComponent,
    MatButtonModule,
    MatIconModule,
    GroupInteractionButtonsComponent,
    GroupDetailsOverviewComponent,
    GroupDetailsHoldingsComponent,
    ReactiveFormsModule,
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

  groupDetailsTabControl = new FormControl<GroupDetailsTab>('overview');

  displayOptions: LabelValue<GroupDetailsTab>[] = [
    { label: 'Overview', value: 'overview' },
    { label: 'Holdings', value: 'holdings' },
  ];
  screenSplit = SCREEN_LAYOUT.LAYOUT_LG;

  constructor() {
    console.log('GroupDetailsComponent');

    effect(() => {
      console.log(this.groupDetailsSignal());
    });
  }

  onSelectionChange(event: MatTabChangeEvent) {
    console.log(event);
  }
}
