import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GroupDetails } from '@market-monitor/api-types';
import { GroupDisplayInfoComponent } from '@market-monitor/modules/group/ui';
import {
  PortfolioBalancePieChartComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';

@Component({
  selector: 'app-group-details-overview',
  standalone: true,
  imports: [
    CommonModule,
    GroupDisplayInfoComponent,
    PortfolioBalancePieChartComponent,
    PortfolioStateComponent,
    PortfolioPeriodChangeComponent,
  ],
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

  ColorScheme = ColorScheme;
}
