import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { USER_HOLDINGS_SYMBOL_LIMIT } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import {
  PortfolioUserFacadeService,
  dashboardChartOptionsInputSource,
} from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionChartComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import {
  DateRangeSliderValues,
  FancyCardComponent,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  GenericChartComponent,
} from '@market-monitor/shared/ui';
import { SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';
import { DashboardPortfolioChartsComponent } from './dashboard-portfolio-charts/dashboard-portfolio-charts.component';

@Component({
  selector: 'app-page-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioStateComponent,
    FancyCardComponent,
    DashboardPortfolioChartsComponent,
    PortfolioPeriodChangeComponent,
    GenericChartComponent,
    PortfolioStateTransactionsComponent,
    PortfolioStateRiskComponent,
    PortfolioHoldingsTableComponent,
    GeneralCardComponent,
    StockSummaryDialogComponent,
    MatDialogModule,
    FormMatInputWrapperComponent,
    PortfolioTransactionChartComponent,
  ],
  templateUrl: './page-dashboard.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDashboardComponent {
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  authenticationUserService = inject(AuthenticationUserStoreService);
  dialog = inject(MatDialog);

  portfolioGrowthDateRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });
  portfolioChangeDateRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  portfolioStateSignal = this.portfolioUserFacadeService.getPortfolioState;

  portfolioChangeSignal = this.portfolioUserFacadeService.getPortfolioChange;
  portfolioAssetAllocation = this.portfolioUserFacadeService.getPortfolioAssetAllocationPieChart;
  portfolioSectorAllocation = this.portfolioUserFacadeService.getPortfolioSectorAllocationPieChart;
  portfolioTransactionToDateSignal = this.portfolioUserFacadeService.getPortfolioTransactionToDate;

  ColorScheme = ColorScheme;
  dashboardChartOptionsInputSource = dashboardChartOptionsInputSource;

  USER_HOLDINGS_SYMBOL_LIMIT = USER_HOLDINGS_SYMBOL_LIMIT;

  onSummaryClick(symbol: string) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
