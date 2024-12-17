import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import {
  PortfolioAssetChartComponent,
  PortfolioChangeChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateOtherComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionsItemComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import { GeneralCardComponent, PieChartComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-page-dashboard',
  standalone: true,
  imports: [
    NgClass,
    PortfolioStateComponent,
    GeneralCardComponent,
    PortfolioPeriodChangeComponent,
    PortfolioStateTransactionsComponent,
    PortfolioStateRiskComponent,
    GeneralCardComponent,
    MatDialogModule,
    PortfolioTransactionsTableComponent,
    PieChartComponent,
    PortfolioGrowthChartComponent,
    PortfolioChangeChartComponent,
    PortfolioAssetChartComponent,
    MatButtonModule,
    PortfolioTransactionsItemComponent,
    PortfolioHoldingsTableCardComponent,
    PortfolioStateOtherComponent,
  ],
  template: `
    <div class="mb-6 flex justify-around gap-4 gap-y-4 max-2xl:overflow-x-scroll md:gap-x-4">
      <!-- portfolio state -->
      <app-general-card class="min-h-[210px] min-w-[550px] flex-1" title="Account">
        <div class="flex gap-x-6">
          <app-portfolio-state
            class="basis-3/5"
            data-testid="page-dashboard-portfolio-state"
            [showSpinner]="!portfolioUserFacadeService.portfolioStateHolding() || showLoadingState()"
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            [showCashSegment]="stateRef.isAccountDemoTrading()"
            [portfolioState]="portfolioUserFacadeService.portfolioStateHolding()"
          />

          <app-portfolio-state-other
            class="basis-2/5"
            data-testid="page-dashboard-portfolio-other"
            [portfolioState]="portfolioUserFacadeService.portfolioStateHolding()"
            [openOrders]="stateRef.outstandingOrders().openOrders"
            [hallOfFameRank]="stateRef.getUserData().systemRank?.portfolioTotalGainsPercentage?.rank"
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          />
        </div>
      </app-general-card>

      <!-- portfolio risk -->
      <app-general-card class="min-h-[210px] min-w-[260px]" title="Risk">
        <app-portfolio-state-risk
          data-testid="page-dashboard-portfolio-risk"
          [portfolioRisk]="stateRef.getUserData().portfolioRisk"
          [titleColor]="ColorScheme.GRAY_DARK_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
        />
      </app-general-card>

      <!-- portfolio transactions -->
      <app-general-card class="min-h-[210px] min-w-[260px]" title="Transactions">
        <app-portfolio-state-transactions
          data-testid="page-dashboard-portfolio-transactions"
          [titleColor]="ColorScheme.GRAY_DARK_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [showFees]="!!stateRef.isAccountDemoTrading()"
          [portfolioState]="portfolioUserFacadeService.portfolioStateHolding()"
        />
      </app-general-card>

      <!-- portfolio change -->
      <app-portfolio-period-change
        data-testid="page-dashboard-period-change"
        [portfolioChange]="portfolioUserFacadeService.portfolioChange()"
        [showData]="{
          daily: true,
          weekly: true,
          twoWeeks: false,
          monthly: true,
        }"
        class="mb-2 mt-4 w-[220px] max-2xl:hidden"
      />
    </div>

    <div class="mb-6 grid gap-x-6 xl:grid-cols-3">
      <!-- portfolio growth chart -->
      <div class="xl:col-span-2">
        @if (showLoadingState()) {
          <div class="g-skeleton mt-6 h-[350px]"></div>
        } @else {
          <app-portfolio-growth-chart
            data-testid="page-dashboard-portfolio-growth-chart"
            headerTitle="Portfolio Growth"
            chartType="balance"
            [data]="{
              values: portfolioUserFacadeService.portfolioGrowth(),
            }"
            [startCash]="stateRef.getUserData().portfolioState.startingCash"
            [heightPx]="320"
          />
        }
      </div>
      <!-- portfolio asset allocation -->
      <div class="max-xl:hidden">
        @if (portfolioUserFacadeService.portfolioStateHolding()) {
          <app-pie-chart
            data-testid="page-dashboard-portfolio-asset-allocation"
            class="mt-4"
            chartTitle="Asset Allocation"
            [heightPx]="280"
            [series]="portfolioUserFacadeService.portfolioAssetAllocationPieChart()"
          />
        } @else {
          <div class="g-skeleton mt-10 h-[280px]"></div>
        }
      </div>
    </div>

    <div class="mb-6 grid gap-x-6 xl:grid-cols-2">
      <!-- portfolio growth chart -->
      @if (showLoadingState()) {
        <div class="g-skeleton mt-6 h-[320px]"></div>
      } @else {
        <app-portfolio-growth-chart
          data-testid="page-dashboard-investment-growth-chart"
          headerTitle="Invested / Market"
          chartType="marketValue"
          [data]="{
            values: portfolioUserFacadeService.portfolioGrowth(),
          }"
          [heightPx]="320"
        />
      }

      <!-- portfolio change chart -->
      @if (showLoadingState()) {
        <div class="g-skeleton mt-6 h-[320px]"></div>
      } @else {
        <app-portfolio-change-chart
          data-testid="page-portfolio-change-chart"
          [data]="portfolioUserFacadeService.portfolioGrowth()"
          [heightPx]="320"
        />
      }
    </div>

    <!-- portfolio assets chart -->
    @if (showLoadingState()) {
      <div class="g-skeleton mb-8 h-[380px]"></div>
    } @else {
      @if ((portfolioUserFacadeService.portfolioGrowth() ?? []).length > 8) {
        <app-general-card title="Asset Growth" class="mb-8 hidden md:block">
          <app-portfolio-asset-chart
            data-testid="portfolio-asset-chart-chart"
            [data]="stateRef.getUserPortfolioTransactions()"
            [heightPx]="350"
          />
        </app-general-card>
      }
    }

    <!-- holding -->
    <app-portfolio-holdings-table-card
      class="mb-6"
      data-testid="page-dashboard-portfolio-holdings-table"
      [portfolioStateHolding]="portfolioUserFacadeService.portfolioStateHolding()"
    />

    <!-- best / worst -->
    @if (hasEnoughTransactions()) {
      <div class="mb-10 grid gap-4 md:grid-cols-2">
        <!-- best transactions -->
        <app-general-card title="Best Returns" matIcon="trending_up" class="flex-1">
          @for (item of stateRef.getUserPortfolioTransactionsBest(); track item.transactionId; let last = $last) {
            <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
              <app-portfolio-transactions-item data-testid="page-dashboard-best-transactions" [transaction]="item" />
            </div>
          }
        </app-general-card>

        <!-- worst transactions -->
        <app-general-card title="Worst Returns" matIcon="trending_down" class="flex-1">
          @for (item of stateRef.getUserPortfolioTransactionsWorst(); track item.transactionId; let last = $last) {
            <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
              <app-portfolio-transactions-item data-testid="page-dashboard-worst-transactions" [transaction]="item" />
            </div>
          }
        </app-general-card>
      </div>
    }

    @if (stateRef.userHaveTransactions()) {
      <!-- transaction history -->
      <app-portfolio-transactions-table
        data-testid="page-dashboard-portfolio-transactions-table"
        [data]="stateRef.portfolioTransactions()"
        [showSymbolFilter]="true"
      />
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
  readonly stateRef = this.authenticationUserService.state;
  readonly hasEnoughTransactions = computed(
    () => (this.stateRef.portfolioTransactions()?.length ?? 0) > this.transactionLimit,
  );

  readonly showLoadingState = computed(() => {
    const userData = this.stateRef.getUserData();
    const portfolioGrowth = this.portfolioUserFacadeService.portfolioGrowth();

    // data not yet loaded or user has demo account but data is not yet created
    return !portfolioGrowth || (userData.isDemo && (portfolioGrowth ?? []).length === 0);
  });
}
