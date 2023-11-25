import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GroupDetails } from '@market-monitor/api-types';

@Component({
  selector: 'app-group-details-holdings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-details-holdings.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsHoldingsComponent {
  @Input({ required: true }) groupDetails!: GroupDetails;
}
