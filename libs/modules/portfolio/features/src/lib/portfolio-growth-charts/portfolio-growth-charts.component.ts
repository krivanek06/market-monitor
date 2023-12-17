import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PortfolioStateHoldings } from '@market-monitor/api-types';
import {
  PortfolioGrowth,
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
import { combineLatest, map, startWith, tap } from 'rxjs';

@Component({
  selector: 'app-portfolio-growth-charts',
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
  templateUrl: './portfolio-growth-charts.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGrowthChartsComponent {
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  @Input({ required: true }) portfolioState!: PortfolioStateHoldings;
  @Input() portfolioAssetsGrowthSignal = this.portfolioUserFacadeService.getPortfolioGrowthAssets;

  dashboardChartOptionsInputSource = dashboardChartOptionsInputSource;

  selectedChartFormControl = new FormControl(dashboardChartOptionsInputSource[0].value, { nonNullable: true });
  portfolioRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  portfolioGrowthChartSignal = toSignal(
    combineLatest([
      this.portfolioRangeControl.valueChanges.pipe(startWith(null)),
      toObservable(this.portfolioUserFacadeService.getPortfolioGrowth),
    ]).pipe(map(([dateRange, data]) => this.filterDataByDateRange(data, dateRange))),
  );

  portfolioChangeChartSignal = toSignal(
    combineLatest([
      this.portfolioRangeControl.valueChanges.pipe(startWith(null)),
      toObservable(this.portfolioUserFacadeService.getPortfolioGrowth),
    ]).pipe(map(([dateRange, data]) => this.filterDataByDateRange(data, dateRange))),
  );

  constructor() {
    toObservable(this.portfolioUserFacadeService.getPortfolioGrowth)
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

  private filterDataByDateRange(data: PortfolioGrowth[], dateRange: DateRangeSliderValues | null): PortfolioGrowth[] {
    if (!dateRange) {
      return data;
    }
    return data.filter(
      (d) =>
        isBefore(new Date(d.date), new Date(dateRange.dates[dateRange.currentMaxDateIndex])) &&
        isAfter(new Date(d.date), new Date(dateRange.dates[dateRange.currentMinDateIndex])),
    );
  }
}
