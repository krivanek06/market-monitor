import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GroupDetails } from '@market-monitor/api-types';

@Component({
  selector: 'app-group-details-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-details-overview.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsOverviewComponent {
  @Input({ required: true }) groupDetails!: GroupDetails;
}
