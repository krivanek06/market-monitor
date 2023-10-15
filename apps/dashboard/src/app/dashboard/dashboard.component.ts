import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioUserFacadeService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { FancyCardComponent, GeneralCardComponent, GenericChartComponent } from '@market-monitor/shared/ui';
import { SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';

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
    PortfolioStateTransactionsComponent,
    PortfolioStateRiskComponent,
    PortfolioHoldingsTableComponent,
    GeneralCardComponent,
    StockSummaryDialogComponent,
    MatDialogModule,
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
  dialog = inject(MatDialog);

  portfolioGrowthSignal = toSignal(this.portfolioUserFacadeService.getPortfolioGrowth());
  portfolioStateSignal = toSignal(this.portfolioUserFacadeService.getPortfolioState());
  portfolioChangeSignal = toSignal(this.portfolioUserFacadeService.getPortfolioChange());
  portfolioAssetAllocation = toSignal(this.portfolioUserFacadeService.getPortfolioAssetAllocationPieChart());
  portfolioSectorAllocation = toSignal(this.portfolioUserFacadeService.getPortfolioSectorAllocationPieChart());

  ColorScheme = ColorScheme;

  onSummaryClick(symbol: string) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
