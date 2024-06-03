import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import {
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  GenericChartComponent,
  PieChartComponent,
  SectionTitleComponent,
  SortByKeyPipe,
} from '@mm/shared/ui';

@Component({
  selector: 'app-page-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
    SortByKeyPipe,
    PieChartComponent,
    MatTooltipModule,
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
      <div class="lg:pt-2">
        <app-portfolio-period-change
          *ngIf="portfolioUserFacadeService.getPortfolioChange() as portfolioChange"
          data-testid="page-dashboard-period-change"
          [portfolioChange]="portfolioChange"
        />
      </div>
    </div>

    <div class="mb-3 flex flex-col gap-4 sm:flex-row">
      <!-- do not show buttons if not enough data -->
      @if (portfolioUserFacadeService.getPortfolioGrowth()?.length ?? 0 > 0) {
        <button
          data-testid="page-dashboard-portfolio-change-button"
          matTooltip="Display daily portfolio change - profit/loss"
          type="button"
          class="hidden sm:block"
          (click)="onPortfolioChangeChart()"
          mat-stroked-button
        >
          Portfolio Change
        </button>
        <button
          data-testid="page-dashboard-asset-growth-button"
          matTooltip="Display invested amount per asset in your portfolio"
          type="button"
          class="hidden sm:block"
          (click)="onAssetGrowthChart()"
          mat-stroked-button
        >
          Asset Growth
        </button>
      }
    </div>

    <!-- dashboard charts -->
    <div class="mb-8">
      <!-- portfolio growth chart -->
      @if (portfolioUserFacadeService.getPortfolioGrowth(); as getPortfolioGrowth) {
        <app-portfolio-growth-chart
          data-testid="page-dashboard-portfolio-growth-chart"
          headerTitle="Portfolio Growth"
          chartType="balance"
          [data]="{
            values: getPortfolioGrowth,
            startingCashValue: portfolioUserFacadeService.getPortfolioState()?.startingCash ?? 0
          }"
          [heightPx]="400"
        />
      } @else {
        <div class="grid place-content-center" [style.height.px]="400">
          <mat-spinner />
        </div>
      }

      <!-- investment growth -->
      @if (portfolioUserFacadeService.getPortfolioGrowth(); as portfolioGrowth) {
        <app-portfolio-growth-chart
          data-testid="page-dashboard-investment-growth-chart"
          headerTitle="Invested Value to Market"
          chartType="marketValue"
          [data]="{
            values: portfolioGrowth,
            startingCashValue: portfolioUserFacadeService.getPortfolioState()?.startingCash ?? 0
          }"
          [heightPx]="400"
        />
      } @else {
        <div class="grid place-content-center" [style.height.px]="400">
          <mat-spinner />
        </div>
      }
    </div>

    <!-- holding -->
    <div class="mb-8">
      <app-portfolio-holdings-table-card
        data-testid="page-dashboard-portfolio-holdings-table"
        [portfolioStateHolding]="portfolioUserFacadeService.getPortfolioState()"
      />
    </div>

    <!-- holdings pie charts -->
    <div class="flex justify-center gap-10 overflow-x-clip max-sm:-ml-6 sm:mb-8 lg:justify-between">
      @if (portfolioUserFacadeService.getPortfolioState()?.holdings; as holdings) {
        @if (holdings.length > 0) {
          <app-pie-chart
            data-testid="page-dashboard-portfolio-asset-allocation"
            class="max-sm:w-[385px]"
            chartTitle="Asset Allocation"
            [heightPx]="400"
            [series]="portfolioUserFacadeService.getPortfolioAssetAllocationPieChart()"
          />
          <app-pie-chart
            data-testid="page-dashboard-portfolio-sector-allocation"
            class="hidden lg:block"
            chartTitle="Sector Allocation"
            [heightPx]="400"
            [series]="portfolioUserFacadeService.getPortfolioSectorAllocationPieChart()"
          />
        }
      } @else {
        <div class="g-skeleton h-[420px] w-full"></div>
        <div class="g-skeleton h-[420px] w-full"></div>
      }
    </div>

    @if (stateRef.userHaveTransactions()) {
      <!-- transaction history -->
      <div class="grid gap-x-8 gap-y-4 xl:grid-cols-3" [ngClass]="{ 'xl:h-[980px]': hasEnoughTransactions() }">
        <!-- all transactions -->
        <app-portfolio-transactions-table
          data-testid="page-dashboard-portfolio-transactions-table"
          [ngClass]="{
            'xl:col-span-2': hasEnoughTransactions(),
            'xl:col-span-3': !hasEnoughTransactions()
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
  private dialogServiceUtil = inject(DialogServiceUtil);
  private authenticationUserService = inject(AuthenticationUserStoreService);
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);

  /**
   * Transaction limit to show best and worst transactions
   */
  readonly transactionLimit = 15;

  stateRef = this.authenticationUserService.state;

  hasEnoughTransactions = computed(() => (this.stateRef.portfolioTransactions()?.length ?? 0) > this.transactionLimit);

  ColorScheme = ColorScheme;

  onPortfolioChangeChart(): void {
    this.dialogServiceUtil.showGenericDialog({
      component: PortfolioChangeChartComponent,
      componentData: <PortfolioChangeChartComponent>{
        data: this.portfolioUserFacadeService.getPortfolioGrowth,
      },
    });
  }

  onAssetGrowthChart(): void {
    this.dialogServiceUtil.showGenericDialog({
      title: 'Portfolio Asset Growth Chart',
      component: PortfolioAssetChartComponent,
      componentData: <PortfolioAssetChartComponent>{
        data: this.portfolioUserFacadeService.getPortfolioGrowthAssets,
      },
    });
  }
}
