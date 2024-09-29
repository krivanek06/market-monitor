import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupInteractionButtonsComponent } from '@mm/group/features';
import { GroupDetailsOverviewComponent } from './group-details-overview/group-details-overview.component';
import { PageGroupsBaseComponent } from './page-groups-base.component';

@Component({
  selector: 'app-page-group-details',
  standalone: true,
  imports: [GroupInteractionButtonsComponent, GroupDetailsOverviewComponent, MatProgressSpinnerModule],
  template: `
    <section class="relative">
      @if (groupDetailsSignal(); as groupDetailsSignal) {
        <!-- action buttons -->
        <app-group-interaction-buttons
          class="max-sm:mb-4 sm:max-lg:-mb-5 lg:mb-4"
          [groupDetails]="groupDetailsSignal"
        />

        <!-- group overview -->
        <app-group-details-overview />
      } @else {
        <div class="grid h-[600px] place-content-center">
          <mat-spinner diameter="100" />
        </div>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageGroupDetailsComponent extends PageGroupsBaseComponent {}
