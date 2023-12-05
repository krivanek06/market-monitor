import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GROUP_MEMBER_LIMIT, GroupData } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-group-display-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, MatButtonModule, MatIconModule, PercentageIncreaseDirective],
  templateUrl: './group-display-item.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDisplayItemComponent {
  @Input({ required: true }) groupData!: GroupData;

  memberLimit = GROUP_MEMBER_LIMIT;
}
