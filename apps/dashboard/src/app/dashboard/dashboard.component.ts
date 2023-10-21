import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import {
  PortfolioUserFacadeService,
  dashboardChartOptionsInputSource,
} from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioChangeChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  FancyCardComponent,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  GenericChartComponent,
} from '@market-monitor/shared/ui';
import { SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';
import { isAfter, isBefore } from 'date-fns';
import { map, startWith, switchMap, tap } from 'rxjs';

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
    FormMatInputWrapperComponent,
    ReactiveFormsModule,
    PortfolioChangeChartComponent,
    DateRangeSliderComponent,
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

  portfolioGrowthChartSignal = toSignal(
    this.portfolioGrowthDateRangeControl.valueChanges.pipe(
      startWith(null),
      switchMap((dateRange) =>
        this.portfolioUserFacadeService
          .getPortfolioGrowth()
          .pipe(
            map((data) =>
              !dateRange
                ? data
                : data.filter(
                    (d) =>
                      isBefore(new Date(d.date), new Date(dateRange.dates[dateRange.currentMaxDateIndex])) &&
                      isAfter(new Date(d.date), new Date(dateRange.dates[dateRange.currentMinDateIndex])),
                  ),
            ),
          ),
      ),
    ),
  );

  portfolioChangeChartSignal = toSignal(
    this.portfolioChangeDateRangeControl.valueChanges.pipe(
      startWith(null),
      switchMap((dateRange) =>
        this.portfolioUserFacadeService
          .getPortfolioGrowth()
          .pipe(
            map((data) =>
              !dateRange
                ? data
                : data.filter(
                    (d) =>
                      isBefore(new Date(d.date), new Date(dateRange.dates[dateRange.currentMaxDateIndex])) &&
                      isAfter(new Date(d.date), new Date(dateRange.dates[dateRange.currentMinDateIndex])),
                  ),
            ),
          ),
      ),
    ),
  );

  portfolioChangeSignal = toSignal(this.portfolioUserFacadeService.getPortfolioChange());
  portfolioAssetAllocation = toSignal(this.portfolioUserFacadeService.getPortfolioAssetAllocationPieChart());
  portfolioSectorAllocation = toSignal(this.portfolioUserFacadeService.getPortfolioSectorAllocationPieChart());

  ColorScheme = ColorScheme;
  dashboardChartOptionsInputSource = dashboardChartOptionsInputSource;

  constructor() {
    this.portfolioGrowthDateRangeControl.valueChanges.subscribe((x) => console.log('lololo', x));

    this.portfolioUserFacadeService
      .getPortfolioGrowth()
      .pipe(
        tap((values) => {
          const sliderValues: DateRangeSliderValues = {
            dates: values.map((point) => point.date),
            currentMinDateIndex: 0,
            currentMaxDateIndex: values.length - 1,
          };

          this.portfolioGrowthDateRangeControl.patchValue(sliderValues);
          this.portfolioChangeDateRangeControl.patchValue(sliderValues);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  onSummaryClick(symbol: string) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
