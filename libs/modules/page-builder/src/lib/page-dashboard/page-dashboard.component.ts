import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { USER_HOLDINGS_SYMBOL_LIMIT } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioUserFacadeService } from '@market-monitor/modules/portfolio/data-access';
import { PortfolioGrowthChartsComponent } from '@market-monitor/modules/portfolio/features';
import {
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionChartComponent,
  PortfolioTransactionsTableComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import {
  DateRangeSliderValues,
  FancyCardComponent,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  GenericChartComponent,
  PieChartComponent,
  SectionTitleComponent,
  SortByKeyPipe,
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
    SectionTitleComponent,
    PortfolioTransactionsTableComponent,
    SortByKeyPipe,
    PieChartComponent,
  ],
  template: `
    <ng-container>
      <div class="grid xl:grid-cols-3 mb-6 sm:mb-10 gap-8">
        <div
          class="flex flex-row max-sm:overflow-x-scroll sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 xl:col-span-2"
        >
          <app-fancy-card
            class="sm:col-span-2 max-sm:min-w-[360px]"
            title="Account"
            [colorPrimary]="ColorScheme.PRIMARY_VAR"
          >
            <app-portfolio-state
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showCashSegment]="!!authenticationUserService.state.userData()?.features?.allowPortfolioCashAccount"
              [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
            ></app-portfolio-state>
          </app-fancy-card>

          <app-fancy-card class="max-sm:min-w-[275px]" title="Risk" [colorPrimary]="ColorScheme.PRIMARY_VAR">
            <app-portfolio-state-risk
              [portfolioState]="authenticationUserService.state.getPortfolioState()"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            ></app-portfolio-state-risk>
          </app-fancy-card>

          <app-fancy-card class="max-sm:min-w-[275px]" title="Transactions" [colorPrimary]="ColorScheme.PRIMARY_VAR">
            <app-portfolio-state-transactions
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showFees]="!!authenticationUserService.state.userData()?.features?.allowPortfolioCashAccount"
              [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
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
          [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
          [portfolioAssetsGrowth]="portfolioUserFacadeService.getPortfolioGrowthAssets()"
          [portfolioGrowth]="portfolioUserFacadeService.getPortfolioGrowth()"
        ></app-portfolio-growth-charts>
      </div>

      <!-- holding -->
      <div class="mb-8">
        <app-general-card
          title="Holdings [{{ (portfolioUserFacadeService.getPortfolioState()?.holdings ?? []).length }} / {{
            USER_HOLDINGS_SYMBOL_LIMIT
          }}]"
          titleScale="large"
          matIcon="show_chart"
        >
          <app-portfolio-holdings-table
            (symbolClicked)="onSummaryClick($event)"
            [holdings]="portfolioUserFacadeService.getPortfolioState()?.holdings ?? []"
            [holdingsBalance]="portfolioUserFacadeService.getPortfolioState()?.holdingsBalance ?? 0"
          ></app-portfolio-holdings-table>
        </app-general-card>
      </div>

      <div class="flex flex-col-reverse xl:flex-row gap-y-4 gap-8">
        <div class="xl:basis-2/3">
          <!-- transaction history -->
          <div>
            <app-section-title title="Transaction History" matIcon="history" class="mb-3" />
            <app-portfolio-transactions-table
              [showTransactionFees]="!!authenticationUserService.state.userData()?.features?.allowPortfolioCashAccount"
              [data]="authenticationUserService.state.portfolioTransactions() | sortByKey: 'date' : 'desc'"
            ></app-portfolio-transactions-table>
          </div>
        </div>

        <!-- holdings pie charts -->
        <div
          class="flex justify-center lg:justify-between xl:justify-around xl:flex-col gap-10 sm:mb-8 overflow-x-clip max-sm:-ml-6"
        >
          <app-pie-chart
            class="max-sm:w-[385px]"
            chartTitle="Asset Allocation"
            [heightPx]="400"
            [series]="portfolioUserFacadeService.getPortfolioAssetAllocationPieChart()"
          ></app-pie-chart>
          <app-pie-chart
            class="hidden lg:block"
            [heightPx]="400"
            chartTitle="Sector Allocation"
            [series]="portfolioUserFacadeService.getPortfolioSectorAllocationPieChart()"
          ></app-pie-chart>
        </div>
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
