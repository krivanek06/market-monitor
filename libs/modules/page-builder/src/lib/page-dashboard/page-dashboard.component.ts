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
import { PortfolioGrowthChartsComponent } from '@market-monitor/modules/portfolio/features';
import {
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionChartComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import {
  DateRangeSliderValues,
  FancyCardComponent,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  GenericChartComponent,
} from '@market-monitor/shared/ui';

@Component({
  selector: 'app-page-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioStateComponent,
    FancyCardComponent,
    PortfolioGrowthChartsComponent,
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
  template: `
    <ng-container *ngIf="portfolioUserFacadeService.getPortfolioState() as portfolioState">
      <div class="grid xl:grid-cols-3 mb-6 sm:mb-10 gap-8">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 xl:col-span-2">
          <app-fancy-card class="sm:col-span-2" title="Account" [colorPrimary]="ColorScheme.PRIMARY_VAR">
            <app-portfolio-state
              [titleColor]="ColorScheme.PRIMARY_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showCashSegment]="!!authenticationUserService.state.userData()?.features?.allowPortfolioCashAccount"
              [portfolioState]="portfolioState"
            ></app-portfolio-state>
          </app-fancy-card>

          <app-fancy-card title="Risk" [colorPrimary]="ColorScheme.PRIMARY_VAR">
            <app-portfolio-state-risk
              [titleColor]="ColorScheme.PRIMARY_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            ></app-portfolio-state-risk>
          </app-fancy-card>

          <app-fancy-card title="Transactions" [colorPrimary]="ColorScheme.PRIMARY_VAR">
            <app-portfolio-state-transactions
              [titleColor]="ColorScheme.PRIMARY_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showFees]="!!authenticationUserService.state.userData()?.features?.allowPortfolioCashAccount"
              [portfolioState]="portfolioState"
            ></app-portfolio-state-transactions>
          </app-fancy-card>
        </div>

        <!-- portfolio change -->
        <div class="lg:pt-2">
          <app-portfolio-period-change
            *ngIf="portfolioUserFacadeService.getPortfolioChange() as portfolioChange"
            [portfolioChange]="portfolioChange"
          ></app-portfolio-period-change>
        </div>
      </div>

      <!-- dashboard charts -->
      <div class="mb-8">
        <app-portfolio-growth-charts
          [showChartChangeSelect]="true"
          [portfolioState]="portfolioState"
          [portfolioAssetsGrowth]="portfolioUserFacadeService.getPortfolioGrowthAssets()"
          [portfolioGrowth]="portfolioUserFacadeService.getPortfolioGrowth()"
        ></app-portfolio-growth-charts>
      </div>

      <!-- holdings pie charts -->
      <div class="flex justify-around mb-10 overflow-x-clip">
        <app-generic-chart
          chartTitle="Asset Allocation"
          [heightPx]="380"
          [showDataLabel]="true"
          chartTitlePosition="center"
          [series]="[portfolioUserFacadeService.getPortfolioAssetAllocationPieChart()]"
        ></app-generic-chart>
        <app-generic-chart
          [heightPx]="380"
          chartTitle="Sector Allocation"
          [showDataLabel]="true"
          chartTitlePosition="center"
          [series]="[portfolioUserFacadeService.getPortfolioSectorAllocationPieChart()]"
        ></app-generic-chart>
      </div>

      <!-- holding -->
      <div class="mb-8">
        <app-general-card
          title="Holdings [{{ portfolioState.holdings.length }} / {{ USER_HOLDINGS_SYMBOL_LIMIT }}]"
          titleScale="large"
          matIcon="show_chart"
        >
          <app-portfolio-holdings-table
            (symbolClicked)="onSummaryClick($event)"
            [holdings]="portfolioState.holdings"
            [holdingsBalance]="portfolioState.holdingsBalance"
          ></app-portfolio-holdings-table>
        </app-general-card>
      </div>

      <!-- transactions chart -->
      <ng-container *ngIf="!!authenticationUserService.state.userData()?.features?.allowPortfolioCashAccount">
        <app-portfolio-transaction-chart
          [data]="portfolioUserFacadeService.getPortfolioTransactionToDate()"
        ></app-portfolio-transaction-chart>
      </ng-container>
    </ng-container>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDashboardComponent {
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  authenticationUserService = inject(AuthenticationUserStoreService);
  private dialog = inject(MatDialog);

  portfolioGrowthDateRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });
  portfolioChangeDateRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

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
