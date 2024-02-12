import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GroupInteractionButtonsComponent } from '@market-monitor/modules/group/features';
import { LabelValue } from '@market-monitor/shared/data-access';
import { SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
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
    MatDialogModule,
  ],
  template: `
    <section *ngIf="groupDetailsSignal() as groupDetailsSignal" class="relative">
      <div class="flex justify-between md:mb-8 xl:mb-12">
        <!-- group action buttons -->
        <div class="lg:-mb-2 flex-1">
          <app-group-interaction-buttons
            class="hidden lg:block"
            [groupDetails]="groupDetailsSignal"
          ></app-group-interaction-buttons>
          <button
            mat-stroked-button
            class="max-md:absolute max-md:right-0 max-md:top-6 block lg:hidden"
            (click)="onGroupOptions()"
          >
            <mat-icon>settings</mat-icon>
            Options
          </button>
        </div>

        <!-- navigation -->
        <app-tab-select-control
          class="hidden md:block"
          [formControl]="groupDetailsTabControl"
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
    </section>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageGroupDetailsComponent extends PageGroupsBaseComponent {
  groupDetailsTabControl = new FormControl<GroupDetailsTab>('overview');

  displayOptions: LabelValue<GroupDetailsTab>[] = [
    { label: 'Overview', value: 'overview' },
    { label: 'Holdings', value: 'holdings' },
  ];

  onGroupOptions() {
    this.dialogServiceUtil.showGenericDialog(
      {
        component: GroupInteractionButtonsComponent,
        title: 'Settings',
        componentData: { groupDetails: this.groupDetailsSignal() },
      },
      SCREEN_DIALOGS.DIALOG_SMALL,
    );
  }
}
