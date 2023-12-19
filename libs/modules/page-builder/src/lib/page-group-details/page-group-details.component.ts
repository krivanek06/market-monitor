import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GroupInteractionButtonsComponent } from '@market-monitor/modules/group/features';
import { LabelValue, SCREEN_LAYOUT } from '@market-monitor/shared/data-access';
import { TabSelectControlComponent } from '@market-monitor/shared/ui';
import { GroupDetailsHoldingsComponent } from './group-details-holdings/group-details-holdings.component';
import { GroupDetailsOverviewComponent } from './group-details-overview/group-details-overview.component';
import { PageGroupsBaseComponent } from './page-groups-base.component';

type GroupDetailsTab = 'overview' | 'holdings';

@Component({
  selector: 'app-page-group-details',
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
  template: `
    <ng-container *ngIf="groupDetailsSignal() as groupDetailsSignal">
      <div class="flex justify-between mb-12">
        <!-- group action buttons -->
        <div class="-mb-2">
          <app-group-interaction-buttons [groupDetails]="groupDetailsSignal"></app-group-interaction-buttons>
        </div>

        <!-- navigation -->
        <app-tab-select-control
          [formControl]="groupDetailsTabControl"
          [screenLayoutSplit]="screenSplit"
          [displayOptions]="displayOptions"
        ></app-tab-select-control>
      </div>

      <!-- group overview -->
      <ng-container *ngIf="groupDetailsTabControl.value === 'overview'">
        <app-group-details-overview></app-group-details-overview>
      </ng-container>

      <!-- group holdings -->
      <ng-container *ngIf="groupDetailsTabControl.value === 'holdings'">
        <app-group-details-holdings></app-group-details-holdings>
      </ng-container>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageGroupDetailsComponent extends PageGroupsBaseComponent {
  groupDetailsTabControl = new FormControl<GroupDetailsTab>('overview');

  displayOptions: LabelValue<GroupDetailsTab>[] = [
    { label: 'Overview', value: 'overview' },
    { label: 'Holdings', value: 'holdings' },
  ];
  screenSplit = SCREEN_LAYOUT.LAYOUT_LG;

  constructor() {
    super();
    console.log('GroupDetailsComponent');

    effect(() => {
      console.log(this.groupDetailsSignal());
    });
  }
}
