import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  PortfolioState,
  PortfolioUserFacadeService,
  dashboardChartOptionsInputSource,
} from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioAssetChartComponent,
  PortfolioChangeChartComponent,
  PortfolioGrowthChartComponent,
} from '@market-monitor/modules/portfolio/ui';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  FormMatInputWrapperComponent,
} from '@market-monitor/shared/ui';
import { isAfter, isBefore } from 'date-fns';
import { map, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-dashboard-portfolio-charts',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioAssetChartComponent,
    DateRangeSliderComponent,
    FormMatInputWrapperComponent,
    PortfolioChangeChartComponent,
    ReactiveFormsModule,
    PortfolioGrowthChartComponent,
  ],
  templateUrl: './dashboard-portfolio-charts.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPortfolioChartsComponent {
  @Input({ required: true }) portfolioState!: PortfolioState;

  portfolioUserFacadeService = inject(PortfolioUserFacadeService);

  dashboardChartOptionsInputSource = dashboardChartOptionsInputSource;

  selectedChartFormControl = new FormControl(dashboardChartOptionsInputSource[0].value, { nonNullable: true });
  portfolioRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  portfolioAssetsGrowthSignal = toSignal(this.portfolioUserFacadeService.getPortfolioGrowthAssets());
  portfolioGrowthChartSignal = toSignal(
    this.portfolioRangeControl.valueChanges.pipe(
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
    this.portfolioRangeControl.valueChanges.pipe(
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

  constructor() {
    this.portfolioRangeControl.valueChanges.subscribe((x) => console.log('lololo', x));

    this.portfolioUserFacadeService
      .getPortfolioGrowth()
      .pipe(
        tap((values) => {
          const sliderValues: DateRangeSliderValues = {
            dates: values.map((point) => point.date),
            currentMinDateIndex: 0,
            currentMaxDateIndex: values.length - 1,
          };

          this.portfolioRangeControl.patchValue(sliderValues);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
