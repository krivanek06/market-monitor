import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
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
import { DashboardPortfolioChartsComponent } from './components/dashboard-portfolio-charts/dashboard-portfolio-charts.component';

@Component({
  selector: 'app-dashboard',
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

  portfolioGrowthDateRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });
  portfolioChangeDateRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  portfolioStateSignal = toSignal(this.portfolioUserFacadeService.getPortfolioState());

  portfolioChangeSignal = toSignal(this.portfolioUserFacadeService.getPortfolioChange());
  portfolioAssetAllocation = toSignal(this.portfolioUserFacadeService.getPortfolioAssetAllocationPieChart());
  portfolioSectorAllocation = toSignal(this.portfolioUserFacadeService.getPortfolioSectorAllocationPieChart());
  portfolioTransactionToDateSignal = toSignal(this.portfolioUserFacadeService.getPortfolioTransactionToDate());

  ColorScheme = ColorScheme;
  dashboardChartOptionsInputSource = dashboardChartOptionsInputSource;

  onSummaryClick(symbol: string) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
