import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { USER_HOLDINGS_SYMBOL_LIMIT } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioUserFacadeService } from '@market-monitor/modules/portfolio/data-access';
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
  PortfolioTransactionsTableComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  FancyCardComponent,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  GenericChartComponent,
  PieChartComponent,
  SectionTitleComponent,
  SortByKeyPipe,
  filterDataByDateRange,
} from '@market-monitor/shared/ui';
import { computedFrom } from 'ngxtension/computed-from';
import { map, pipe, startWith } from 'rxjs';

@Component({
  selector: 'app-page-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioStateComponent,
    FancyCardComponent,
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
        <!-- portfolio growth -->
        <div class="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <!-- select chart title -->
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <app-section-title title="Portfolio Growth" class="mr-6 max-lg:flex-1" />
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
          ></app-date-range-slider>
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

      @if (authenticationUserService.state.userHaveTransactions()) {
        @defer {
          <div class="flex flex-col-reverse xl:flex-row gap-y-4 gap-8">
            <div class="xl:basis-2/3">
              <!-- transaction history -->
              <div>
                <app-section-title title="Transaction History" matIcon="history" class="mb-3" />
                <app-portfolio-transactions-table
                  [showTransactionFees]="
                    !!authenticationUserService.state.userData()?.features?.allowPortfolioCashAccount
                  "
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
          <app-portfolio-transaction-chart
            *ngIf="!!authenticationUserService.state.userData()?.features?.allowPortfolioCashAccount"
            [data]="portfolioUserFacadeService.getPortfolioTransactionToDate()"
          ></app-portfolio-transaction-chart>
        }
      }
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
  private dialogServiceUtil = inject(DialogServiceUtil);

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
      componentData: {
        data: this.portfolioUserFacadeService.getPortfolioGrowth() ?? [],
      },
    });
  }

  onAssetGrowthChart(): void {
    this.dialogServiceUtil.showGenericDialog({
      title: 'Portfolio Asset Growth Chart',
      component: PortfolioAssetChartComponent,
      componentData: {
        data: this.portfolioUserFacadeService.getPortfolioGrowthAssets() ?? [],
      },
    });
  }
}
