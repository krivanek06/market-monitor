import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GROUP_MEMBER_LIMIT, GroupData } from '@market-monitor/api-types';
import { DefaultImgDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-group-display-info',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, MatButtonModule, MatIconModule],
  templateUrl: './group-display-info.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDisplayInfoComponent {
  @Output() ownerClickEmitter = new EventEmitter<void>();

  @Input() imageHeightPx = 125;
  @Input({ required: true }) groupData!: GroupData;
  @Input() clickableOwner = false;

  GROUP_MEMBER_LIMIT = GROUP_MEMBER_LIMIT;

  onOwnerClick(): void {
    if (this.clickableOwner) {
      this.ownerClickEmitter.emit();
    }
  }
}
