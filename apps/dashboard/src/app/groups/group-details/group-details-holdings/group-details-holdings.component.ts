import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageGroupsBaseComponent } from '../page-groups-base.component';

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
export class GroupDetailsHoldingsComponent extends PageGroupsBaseComponent {}
