import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { USER_HOLDINGS_SYMBOL_LIMIT } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import {
  PortfolioAssetChartComponent,
  PortfolioChangeChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionChartComponent,
  PortfolioTransactionsItemComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import {
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  GenericChartComponent,
  PieChartComponent,
  SectionTitleComponent,
} from '@mm/shared/ui';

@Component({
  selector: 'app-page-dashboard',
  standalone: true,
  imports: [
    NgClass,
    PortfolioStateComponent,
    GeneralCardComponent,
    PortfolioPeriodChangeComponent,
    GenericChartComponent,
    PortfolioStateTransactionsComponent,
    PortfolioStateRiskComponent,
    GeneralCardComponent,
    StockSummaryDialogComponent,
    MatDialogModule,
    FormMatInputWrapperComponent,
    PortfolioTransactionChartComponent,
    SectionTitleComponent,
    PortfolioTransactionsTableComponent,
    PieChartComponent,
    PortfolioGrowthChartComponent,
    PortfolioChangeChartComponent,
    PortfolioAssetChartComponent,
    MatButtonModule,
    MatProgressSpinner,
    PortfolioTransactionsItemComponent,
    PortfolioHoldingsTableCardComponent,
  ],
  template: `
    <div class="mb-6 grid gap-8 sm:mb-8 xl:grid-cols-3">
      <div
        class="flex flex-row gap-4 max-sm:overflow-x-scroll sm:grid sm:grid-cols-2 md:gap-6 lg:grid-cols-4 xl:col-span-2"
      >
        <!-- portfolio state -->
        <app-general-card
          class="min-h-[210px] max-sm:min-w-[360px] sm:col-span-2"
          title="Account"
          [showLoadingState]="!portfolioUserFacadeService.getPortfolioState()"
        >
          <app-portfolio-state
            data-testid="page-dashboard-portfolio-state"
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            [showCashSegment]="stateRef.isAccountDemoTrading()"
            [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
          />
        </app-general-card>

        <!-- portfolio risk -->
        <app-general-card
          class="min-h-[210px] max-sm:min-w-[275px]"
          title="Risk"
          [showLoadingState]="!portfolioUserFacadeService.getPortfolioState()"
        >
          <app-portfolio-state-risk
            data-testid="page-dashboard-portfolio-risk"
            [portfolioRisk]="stateRef.getUserDataNormal()?.portfolioRisk"
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          />
        </app-general-card>

        <!-- portfolio transactions -->
        <app-general-card
          class="min-h-[210px] max-sm:min-w-[275px]"
          title="Transactions"
          [showLoadingState]="!portfolioUserFacadeService.getPortfolioState()"
        >
          <app-portfolio-state-transactions
            data-testid="page-dashboard-portfolio-transactions"
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            [showFees]="!!stateRef.isAccountDemoTrading()"
            [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
          />
        </app-general-card>
      </div>

      <!-- portfolio change -->
      @if (portfolioUserFacadeService.getPortfolioChange(); as portfolioChange) {
        <app-portfolio-period-change
          data-testid="page-dashboard-period-change"
          [portfolioChange]="portfolioChange"
          class="lg:pt-2"
        />
      }
    </div>

    <!-- portfolio growth chart -->
    <div class="mb-10">
      @if (portfolioUserFacadeService.getPortfolioGrowth(); as getPortfolioGrowth) {
        <app-portfolio-growth-chart
          data-testid="page-dashboard-portfolio-growth-chart"
          headerTitle="Portfolio Growth"
          chartType="balance"
          [data]="{
            values: getPortfolioGrowth,
          }"
          [heightPx]="350"
        />
      } @else {
        <div class="g-skeleton mt-6 h-[380px]"></div>
      }
    </div>

    <div class="mb-8 grid grid-cols-1 gap-x-10 lg:grid-cols-2">
      <!-- portfolio growth chart -->
      @if (portfolioUserFacadeService.getPortfolioGrowth(); as portfolioGrowth) {
        <app-portfolio-growth-chart
          data-testid="page-dashboard-investment-growth-chart"
          headerTitle="Invested / Market"
          chartType="marketValue"
          [data]="{
            values: portfolioGrowth,
          }"
          [heightPx]="360"
          [dateRangeWidth]="400"
        />

        <!-- portfolio change chart -->
        <app-portfolio-change-chart
          data-testid="page-portfolio-change-chart"
          [data]="portfolioGrowth"
          [heightPx]="360"
          [dateRangeWidth]="400"
        />
      } @else {
        <div class="g-skeleton mt-8 h-[360px]"></div>
        <div class="g-skeleton mt-8 h-[360px]"></div>
      }
    </div>

    <!-- holdings pie charts -->
    <div class="flex justify-center gap-10 overflow-x-clip max-sm:-ml-6 sm:mb-14 lg:justify-around">
      @if (portfolioUserFacadeService.getPortfolioState()?.holdings; as holdings) {
        @if (holdings.length > 0) {
          <app-pie-chart
            data-testid="page-dashboard-portfolio-asset-allocation"
            class="max-sm:w-[385px]"
            chartTitle="Asset Allocation"
            [heightPx]="365"
            [series]="portfolioUserFacadeService.getPortfolioAssetAllocationPieChart()"
          />
          <app-pie-chart
            data-testid="page-dashboard-portfolio-sector-allocation"
            class="hidden lg:block"
            chartTitle="Sector Allocation"
            [heightPx]="365"
            [series]="portfolioUserFacadeService.getPortfolioSectorAllocationPieChart()"
          />
        }
      } @else {
        <div class="g-skeleton h-[380px] w-full"></div>
        <div class="g-skeleton h-[380px] w-full"></div>
      }
    </div>

    <!-- portfolio assets chart -->
    @if (portfolioUserFacadeService.getPortfolioGrowth(); as growth) {
      @if (growth.length > 8) {
        <app-general-card title="Asset Growth" class="mb-8">
          <app-portfolio-asset-chart
            data-testid="portfolio-asset-chart-chart"
            [data]="portfolioUserFacadeService.getPortfolioGrowthAssets()"
            [heightPx]="350"
          />
        </app-general-card>
      }
    } @else {
      <div class="g-skeleton h-[380px]"></div>
    }

    <!-- holding -->
    <app-portfolio-holdings-table-card
      class="mb-12"
      data-testid="page-dashboard-portfolio-holdings-table"
      [portfolioStateHolding]="portfolioUserFacadeService.getPortfolioState()"
      [maximumHoldingLimit]="USER_HOLDINGS_SYMBOL_LIMIT"
    />

    @if (stateRef.userHaveTransactions()) {
      <!-- transaction history -->
      <div class="grid gap-x-8 gap-y-4 xl:grid-cols-3" [ngClass]="{ 'xl:h-[980px]': hasEnoughTransactions() }">
        <!-- all transactions -->
        <app-portfolio-transactions-table
          data-testid="page-dashboard-portfolio-transactions-table"
          [ngClass]="{
            'xl:col-span-2': hasEnoughTransactions(),
            'xl:col-span-3': !hasEnoughTransactions(),
          }"
          [showTransactionFees]="!!stateRef.isAccountDemoTrading()"
          [data]="stateRef.portfolioTransactions()"
          [showSymbolFilter]="true"
        />

        <!-- best / worst -->
        @if (hasEnoughTransactions()) {
          <div class="hidden flex-col gap-4 sm:flex lg:pt-6 lg:max-xl:flex-row">
            <!-- best transactions -->
            <app-general-card title="Best Returns" matIcon="trending_up" class="flex-1">
              @for (item of stateRef.getUserPortfolioTransactionsBest(); track item.transactionId; let last = $last) {
                <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                  <app-portfolio-transactions-item
                    data-testid="page-dashboard-best-transactions"
                    [transaction]="item"
                  />
                </div>
              }
            </app-general-card>

            <!-- worst transactions -->
            <app-general-card title="Worst Returns" matIcon="trending_down" class="flex-1">
              @for (item of stateRef.getUserPortfolioTransactionsWorst(); track item.transactionId; let last = $last) {
                <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                  <app-portfolio-transactions-item
                    data-testid="page-dashboard-worst-transactions"
                    [transaction]="item"
                  />
                </div>
              }
            </app-general-card>
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDashboardComponent {
  readonly authenticationUserService = inject(AuthenticationUserStoreService);
  readonly portfolioUserFacadeService = inject(PortfolioUserFacadeService);

  /**
   * Transaction limit to show best and worst transactions
   */
  readonly transactionLimit = 15;
  readonly ColorScheme = ColorScheme;
  readonly USER_HOLDINGS_SYMBOL_LIMIT = USER_HOLDINGS_SYMBOL_LIMIT;
  readonly stateRef = this.authenticationUserService.state;
  readonly hasEnoughTransactions = computed(
    () => (this.stateRef.portfolioTransactions()?.length ?? 0) > this.transactionLimit,
  );
}
