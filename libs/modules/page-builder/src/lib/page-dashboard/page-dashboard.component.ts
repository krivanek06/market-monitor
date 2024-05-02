import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { USER_HOLDINGS_SYMBOL_LIMIT } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import {
  PortfolioAssetChartComponent,
  PortfolioChangeChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionChartComponent,
  PortfolioTransactionsItemComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  GenericChartComponent,
  PieChartComponent,
  SectionTitleComponent,
  SortByKeyPipe,
  filterDataByDateRange,
} from '@mm/shared/ui';
import { computedFrom } from 'ngxtension/computed-from';
import { map, pipe, startWith } from 'rxjs';

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
    MatTooltipModule,
    PortfolioGrowthChartComponent,
    PortfolioChangeChartComponent,
    DateRangeSliderComponent,
    PortfolioAssetChartComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinner,
    PortfolioTransactionsItemComponent,
  ],
  template: `
    <div class="grid xl:grid-cols-3 mb-6 sm:mb-10 gap-8">
      <div
        class="flex flex-row max-sm:overflow-x-scroll sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 xl:col-span-2"
      >
        <!-- portfolio state -->
        <app-general-card
          class="sm:col-span-2 max-sm:min-w-[360px] min-h-[210px]"
          title="Account"
          [showLoadingState]="!portfolioUserFacadeService.getPortfolioState()"
        >
          <app-portfolio-state
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            [showCashSegment]="stateRef.isAccountDemoTrading()"
            [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
          />
        </app-general-card>

        <!-- portfolio risk -->
        <app-general-card
          class="max-sm:min-w-[275px] min-h-[210px]"
          title="Risk"
          [showLoadingState]="!portfolioUserFacadeService.getPortfolioState()"
        >
          <app-portfolio-state-risk
            [portfolioRisk]="stateRef.getUserDataNormal()?.portfolioRisk"
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          />
        </app-general-card>

        <!-- portfolio transactions -->
        <app-general-card
          class="max-sm:min-w-[275px] min-h-[210px]"
          title="Transactions"
          [showLoadingState]="!portfolioUserFacadeService.getPortfolioState()"
        >
          <app-portfolio-state-transactions
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
          [portfolioChange]="portfolioChange"
        />
      </div>
    </div>

    <!-- dashboard charts -->
    <div class="mb-8">
      <!-- portfolio growth -->
      <div class="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <!-- select chart title -->
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <app-section-title title="Portfolio Growth" class="mr-6 max-lg:flex-1" />
          <!-- do not show buttons if not enough data -->
          @if (portfolioUserFacadeService.getPortfolioGrowth()?.length ?? 0 > 0) {
            <button
              (click)="onPortfolioChangeChart()"
              matTooltip="Display daily portfolio change - profit/loss"
              type="button"
              class="hidden sm:block"
              mat-stroked-button
            >
              Portfolio Change
            </button>
            <button
              (click)="onAssetGrowthChart()"
              matTooltip="Display invested amount per asset in your portfolio"
              type="button"
              class="hidden sm:block"
              mat-stroked-button
            >
              Asset Growth
            </button>
          }
        </div>

        <!-- date range -->
        <app-date-range-slider
          *ngIf="portfolioUserFacadeService.getPortfolioGrowth()?.length ?? 0 > 0"
          class="w-full lg:w-[550px]"
          [formControl]="portfolioGrowthRangeControl"
        />
      </div>

      <!-- portfolio growth chart -->
      @if (portfolioUserFacadeService.getPortfolioGrowth()) {
        <app-portfolio-growth-chart
          [data]="{
            values: portfolioGrowthChartSignal(),
            startingCashValue: portfolioUserFacadeService.getPortfolioState()?.startingCash ?? 0
          }"
          [displayHeader]="false"
          [heightPx]="400"
          chartType="balance"
        />
      } @else {
        <div class="grid place-content-center" [style.height.px]="400">
          <mat-spinner></mat-spinner>
        </div>
      }

      <!-- investment growth -->
      @if (portfolioUserFacadeService.getPortfolioGrowth(); as portfolioGrowth) {
        <app-portfolio-growth-chart
          headerTitle="Invested Value to Market"
          [displayHeader]="true"
          [data]="{
            values: portfolioGrowth,
            startingCashValue: portfolioUserFacadeService.getPortfolioState()?.startingCash ?? 0
          }"
          [heightPx]="400"
          chartType="marketValue"
        />
      } @else {
        <div class="grid place-content-center" [style.height.px]="400">
          <mat-spinner></mat-spinner>
        </div>
      }
    </div>

    <!-- holding -->
    <div class="mb-8">
      <app-general-card
        title="Holdings [{{ (portfolioUserFacadeService.getPortfolioState()?.holdings ?? []).length }} / {{
          USER_HOLDINGS_SYMBOL_LIMIT
        }}]"
        matIcon="show_chart"
      >
        <app-portfolio-holdings-table
          [showSkeletonLoading]="!portfolioUserFacadeService.getPortfolioState()?.holdings"
          (symbolClicked)="onSummaryClick($event)"
          [holdings]="portfolioUserFacadeService.getPortfolioState()?.holdings ?? []"
          [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
        />
      </app-general-card>
    </div>

    @defer (on idle) {
      @if ((portfolioUserFacadeService.getPortfolioState()?.holdings ?? []).length > 0) {
        <!-- holdings pie charts -->
        <div class="flex justify-center lg:justify-between gap-10 sm:mb-8 overflow-x-clip max-sm:-ml-6">
          <app-pie-chart
            class="max-sm:w-[385px]"
            chartTitle="Asset Allocation"
            [heightPx]="400"
            [series]="portfolioUserFacadeService.getPortfolioAssetAllocationPieChart()"
          />
          <app-pie-chart
            class="hidden lg:block"
            [heightPx]="400"
            chartTitle="Sector Allocation"
            [series]="portfolioUserFacadeService.getPortfolioSectorAllocationPieChart()"
          />
        </div>
      }

      @if (stateRef.userHaveTransactions()) {
        <!-- transaction history -->
        <app-section-title title="Transaction History" matIcon="history" class="mb-5 lg:-mb-10" />
        <div class="grid xl:grid-cols-3 gap-x-8 gap-y-4" [ngClass]="{ 'xl:h-[980px]': portfolioLength() > 15 }">
          <!-- all transactions -->
          <app-portfolio-transactions-table
            [ngClass]="{
              'xl:col-span-2': portfolioLength() > 15,
              'xl:col-span-3': portfolioLength() <= 15
            }"
            [showTransactionFees]="!!stateRef.isAccountDemoTrading()"
            [data]="stateRef.portfolioTransactions()"
            [showSymbolFilter]="true"
          />

          <!-- best / worst -->
          <div *ngIf="portfolioLength() > 15" class="hidden sm:flex lg:max-xl:flex-row flex-col gap-4">
            <app-general-card title="Best Returns" matIcon="trending_up" class="flex-1">
              @for (item of stateRef.getUserPortfolioTransactionsBest(); track item.transactionId; let last = $last) {
                <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                  <app-portfolio-transactions-item [transaction]="item" />
                </div>
              }
            </app-general-card>

            <app-general-card title="Worst Returns" matIcon="trending_down" class="flex-1">
              @for (item of stateRef.getUserPortfolioTransactionsWorst(); track item.transactionId; let last = $last) {
                <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                  <app-portfolio-transactions-item [transaction]="item" />
                </div>
              }
            </app-general-card>
          </div>
        </div>
      }
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
  private dialog = inject(MatDialog);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private authenticationUserService = inject(AuthenticationUserStoreService);
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);

  stateRef = this.authenticationUserService.state;

  portfolioLength = computed(() => this.stateRef.portfolioTransactions()?.length ?? 0);

  portfolioGrowthRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  portfolioGrowthChartSignal = computedFrom(
    [
      this.portfolioGrowthRangeControl.valueChanges.pipe(startWith(null)),
      this.portfolioUserFacadeService.getPortfolioGrowth,
    ],
    pipe(map(([dateRange, data]) => filterDataByDateRange(data ?? [], dateRange))),
  );

  ColorScheme = ColorScheme;

  USER_HOLDINGS_SYMBOL_LIMIT = USER_HOLDINGS_SYMBOL_LIMIT;

  /**
   * patching date values into the portfolio growth slider
   */
  patchSliderEffect = effect(
    () => {
      const data = this.portfolioUserFacadeService.getPortfolioGrowth() ?? [];

      // patch values only if empty
      this.portfolioGrowthRangeControl.patchValue({
        dates: data.map((point) => point.date),
        currentMinDateIndex: 0,
        currentMaxDateIndex: data.length - 1,
      });
    },
    {
      allowSignalWrites: true,
    },
  );

  onSummaryClick(symbol: string) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

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
