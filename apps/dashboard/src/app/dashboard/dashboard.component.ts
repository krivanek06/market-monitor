import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { PortfolioUserFacadeService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { FancyCardComponent, GenericChartComponent } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioStateComponent,
    FancyCardComponent,
    PortfolioGrowthChartComponent,
    PortfolioPeriodChangeComponent,
    GenericChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  authenticationUserService = inject(AuthenticationUserService);

  portfolioGrowthSignal = toSignal(this.portfolioUserFacadeService.getPortfolioGrowth());
  portfolioStateSignal = toSignal(this.portfolioUserFacadeService.getPortfolioState());
  portfolioChangeSignal = toSignal(this.portfolioUserFacadeService.getPortfolioChange());
  portfolioAssetAllocation = toSignal(this.portfolioUserFacadeService.getPortfolioAssetAllocationPieChart());
  portfolioSectorAllocation = toSignal(this.portfolioUserFacadeService.getPortfolioSectorAllocationPieChart());

  ColorScheme = ColorScheme;
}
