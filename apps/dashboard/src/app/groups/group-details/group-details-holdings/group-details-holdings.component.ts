import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PortfolioCalculationService } from '@market-monitor/modules/portfolio/data-access';
import { GenericChartComponent } from '@market-monitor/shared/ui';
import { PageGroupsBaseComponent } from '../page-groups-base.component';

@Component({
  selector: 'app-group-details-holdings',
  standalone: true,
  imports: [CommonModule, GenericChartComponent],
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
export class GroupDetailsHoldingsComponent extends PageGroupsBaseComponent {
  portfolioCalculationService = inject(PortfolioCalculationService);
  portfolioSectorAllocation = null;
}
