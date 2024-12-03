import { ChangeDetectionStrategy, Component, effect, input, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PortfolioGrowth, UserBaseMin } from '@mm/api-types';
import { ChartConstructor, ColorScheme, GenericChartSeries } from '@mm/shared/data-access';
import {
  fillOutMissingDatesForDate,
  formatValueIntoCurrency,
  getCurrentDateDefaultFormat,
} from '@mm/shared/general-util';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  filterDataByDateRange,
  filterDataByIndexRange,
  SectionTitleComponent,
} from '@mm/shared/ui';
import { HighchartsChartModule } from 'highcharts-angular';
import { map } from 'rxjs';

export type PortfolioGrowthCompareChartData = {
  portfolioGrowth: PortfolioGrowth[];
  userData: UserBaseMin;
};

@Component({
  selector: 'app-portfolio-growth-compare-chart',
  standalone: true,
  imports: [HighchartsChartModule, DateRangeSliderComponent, ReactiveFormsModule, SectionTitleComponent],
  template: `
    <div class="mb-2 flex flex-col items-center lg:flex-row lg:justify-between">
      <!-- title -->
      @if (title()) {
        <app-section-title matIcon="compare_arrows" [title]="title()" />
      }

      <!-- time slider -->
      @if (dateRangeControl.value.dates.length > 0) {
        <app-date-range-slider
          class="hidden w-[550px] md:block"
          [formControl]="dateRangeControl"
          [filterType]="filterType()"
        />
      }
    </div>

    <!-- chart -->
    @if (chartOptionsSignal() && dateRangeControl.value.dates.length > 0) {
      <highcharts-chart
        [Highcharts]="Highcharts"
        [options]="chartOptionsSignal()"
        [callbackFunction]="chartCallback"
        [style.height.px]="heightPx()"
        [oneToOne]="true"
        style="display: block; width: 100%"
      />
    } @else {
      <div class="grid place-content-center text-base" [style.height.px]="heightPx()">No data available</div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGrowthCompareChartComponent extends ChartConstructor {
  /**
   * data range control for chart zoom
   */
  readonly dateRangeControl = new FormControl<DateRangeSliderValues>(
    {
      dates: [],
      currentMinDateIndex: 0,
      currentMaxDateIndex: 0,
    },
    { nonNullable: true },
  );

  readonly data = input.required<PortfolioGrowthCompareChartData[]>();
  readonly title = input<string>('');

  /**
   * date - filter by date,
   * round - filter by index
   */
  readonly filterType = input<'date' | 'round'>('date');

  readonly dateRangeControlEffect = effect(() => {
    const filterType = this.filterType();
    const dataValues = this.data();

    // get the default date - today
    const defaultDate = getCurrentDateDefaultFormat();

    // find the data with minimum date
    const dataMinimalDate = dataValues
      .filter((d) => d.portfolioGrowth.length > 1)
      .map((d) => d.portfolioGrowth.map((e) => e.date))
      .reduce((acc, curr) => (acc < curr[0] ? acc : curr[0]), defaultDate);

    // find the data with maximum date
    const dataMaximalDate = dataValues
      .filter((d) => d.portfolioGrowth.length > 1)
      .map((d) => d.portfolioGrowth.map((e) => e.date))
      .reduce((acc, curr) => (acc > (curr.at(-1) ?? defaultDate) ? acc : (curr.at(-1) ?? defaultDate)), defaultDate);

    // each user can have different starting and ending date (if inactive) and date gap may exists - may be empty
    const dateInterval =
      filterType === 'date'
        ? fillOutMissingDatesForDate(dataMinimalDate, dataMaximalDate)
        : Array.from({ length: dataValues.at(0)?.portfolioGrowth.length ?? 0 }, (_, i) => String(i));

    untracked(() => {
      // set the date range
      this.dateRangeControl.patchValue({
        currentMaxDateIndex: dateInterval.length - 1,
        currentMinDateIndex: 0,
        dates: dateInterval,
      });
    });
  });

  /**
   * create chart options only when date range triggers, otherwise chart is not created
   */
  readonly chartOptionsSignal = toSignal(
    this.dateRangeControl.valueChanges.pipe(
      map((dateRange) => {
        const data = this.data();
        const filterType = this.filterType();

        // determine how to filter date, either by date or index
        const compareFn = filterType === 'date' ? filterDataByDateRange : filterDataByIndexRange;

        if (!data || !dateRange) {
          return this.initChart([]);
        }

        // filter the data based on the date range
        const filteredData = data.map((d) => ({
          userData: d.userData,
          portfolioGrowth: compareFn(d.portfolioGrowth, dateRange),
        }));

        return this.initChart(filteredData);
      }),
    ),
    { initialValue: this.initChart([]) },
  );

  private initChart(data: PortfolioGrowthCompareChartData[]): Highcharts.Options {
    const isDate = this.filterType() === 'date';

    const series = data.map(
      (d) =>
        ({
          type: 'line',
          name: `${d.userData.personal.displayName}`,
          data: isDate
            ? d.portfolioGrowth.map((point) => [Date.parse(point.date), point.balanceTotal])
            : d.portfolioGrowth.map((d) => d.balanceTotal),
        }) satisfies GenericChartSeries<'line'>,
    );

    return {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#868686',
        },
      },
      yAxis: [
        {
          title: {
            text: '',
          },
          startOnTick: false,
          endOnTick: false,
          opposite: false,
          gridLineWidth: 1,
          //minorTickInterval: 'auto',
          tickPixelInterval: 30,
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          //minorGridLineWidth: 0,
          visible: true,
          labels: {
            style: {
              color: ColorScheme.GRAY_MEDIUM_VAR,
              font: '10px Trebuchet MS, Verdana, sans-serif',
            },
          },
        },
      ],
      xAxis: {
        visible: true,
        crosshair: true,
        type: isDate ? 'datetime' : 'category',
        categories: isDate ? undefined : data.at(0)?.portfolioGrowth.map((d) => `Round ${d.date}`),
        dateTimeLabelFormats: {
          day: '%e of %b',
        },
        labels: {
          rotation: -20,
          enabled: true,
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
      },
      title: {
        text: '',
      },
      subtitle: undefined,
      scrollbar: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
        //floating: true,
        verticalAlign: 'top',
        align: 'left',
        //layout: 'vertical',
        y: -8,
        //x: 50,
        itemStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          cursor: 'default',
          fontSize: '12px',
        },
        itemHoverStyle: {
          color: ColorScheme.GRAY_LIGHT_VAR,
        },
        itemHiddenStyle: {
          color: ColorScheme.GRAY_DARK_VAR,
        },
        labelFormatter: function () {
          const that = this as any;
          return `<span style="color: ${that.color};">${that.name}</span>`;
        },
      },
      tooltip: {
        padding: 11,
        enabled: true,
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        xDateFormat: '%A, %b %e, %Y',
        style: {
          fontSize: '16px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        shared: true,
        headerFormat: `<p style="color:${ColorScheme.GRAY_DARK_VAR}; font-size: 12px">{point.key}</p><br/>`,
        pointFormatter: function () {
          const that = this as any;
          const value = formatValueIntoCurrency(that.y);

          const name = that.series.name.toLowerCase();

          return `<p><span style="color: ${that.series.color}; font-weight: bold" class="capitalize">● ${name}: </span><span>${value}</span></p><br/>`;
        },
      },
      plotOptions: {
        line: {
          marker: {
            radius: 3,
          },
          lineWidth: 2,
          states: {
            hover: {
              lineWidth: 2,
            },
          },
          threshold: null,
        },
        series: {
          borderWidth: 2,
          enableMouseTracking: true,
        },
      },
      series: series,
    };
  }
}
