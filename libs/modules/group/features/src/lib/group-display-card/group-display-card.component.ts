import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { GroupData } from '@market-monitor/api-types';
import { GroupDisplayInfoComponent } from '@market-monitor/modules/group/ui';
import { PortfolioBalancePieChartComponent } from '@market-monitor/modules/portfolio/ui';

@Component({
  selector: 'app-group-display-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    GroupDisplayInfoComponent,
    MatRippleModule,
    MatIconModule,
    PortfolioBalancePieChartComponent,
  ],
  templateUrl: './group-display-card.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDisplayCardComponent {
  @Output() groupClickEmitter = new EventEmitter<void>();
  @Input({ required: true }) groupData!: GroupData;

  onGroupClick(): void {
    this.groupClickEmitter.emit();
  }
}
