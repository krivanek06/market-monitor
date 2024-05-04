import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserBase } from '@mm/api-types';
import { PortfolioGrowth } from '@mm/portfolio/data-access';
import { ChartConstructor, ColorScheme, GenericChartSeries } from '@mm/shared/data-access';
import { fillOutMissingDatesForDate, formatValueIntoCurrency } from '@mm/shared/general-util';
import { DateRangeSliderComponent, DateRangeSliderValues } from '@mm/shared/ui';
import { HighchartsChartModule } from 'highcharts-angular';
import { map } from 'rxjs';

export type PortfolioGrowthCompareChartData = {
  portfolioGrowth: PortfolioGrowth[];
  userBase: UserBase;
};

@Component({
  selector: 'app-portfolio-growth-compare-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, DateRangeSliderComponent, ReactiveFormsModule],
  template: `
    <!-- time slider -->
    <div class="flex justify-end">
      <app-date-range-slider
        *ngIf="dateRangeControl.value.dates.length > 0"
        class="hidden md:block w-[550px]"
        [formControl]="dateRangeControl"
      />
    </div>

    <!-- chart -->
    @if (chartOptionsSignal() && dateRangeControl.value.dates.length > 0) {
      @if (chartOptionsSignal(); as chartOptionsSignal) {
        <highcharts-chart
          *ngIf="isHighcharts()"
          [Highcharts]="Highcharts"
          [options]="chartOptionsSignal"
          [callbackFunction]="chartCallback"
          [style.height.px]="heightPx()"
          style="display: block; width: 100%"
        />
      }
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
  dateRangeControl = new FormControl<DateRangeSliderValues>(
    {
      dates: [],
      currentMinDateIndex: 0,
      currentMaxDateIndex: 0,
    },
    { nonNullable: true },
  );

  data = input.required<PortfolioGrowthCompareChartData[]>();

  dateRangeControlEffect = effect(
    () => {
      // no data provided
      if (this.data().length === 0) {
        this.dateRangeControl.patchValue({
          currentMaxDateIndex: 0,
          currentMinDateIndex: 0,
          dates: [],
        });
        return;
      }

      // find the data with minimum date
      const dataMinimalDate = this.data()
        .filter((d) => d.portfolioGrowth.length > 1)
        .reduce((acc, curr) => (acc.portfolioGrowth[0].date < curr.portfolioGrowth[0].date ? acc : curr));

      // find the data with maximum date
      const dataMaximalDate = this.data()
        .filter((d) => d.portfolioGrowth.length > 1)
        .reduce((acc, curr) =>
          acc.portfolioGrowth[acc.portfolioGrowth.length - 1].date >
          curr.portfolioGrowth[curr.portfolioGrowth.length - 1].date
            ? acc
            : curr,
        );

      // empty portfolio growth
      if (dataMinimalDate.portfolioGrowth.length === 0 || dataMaximalDate.portfolioGrowth.length === 0) {
        return;
      }

      // get starting and ending date and fill out missing dates
      // each user can have different starting and ending date and date gap may exists
      const startingDate = new Date(dataMinimalDate.portfolioGrowth[0].date);
      const endingDate = new Date(dataMaximalDate.portfolioGrowth[dataMaximalDate.portfolioGrowth.length - 1].date);
      const dateInterval = fillOutMissingDatesForDate(startingDate, endingDate);

      this.dateRangeControl.patchValue({
        currentMaxDateIndex: dateInterval.length - 1,
        currentMinDateIndex: 0,
        dates: dateInterval,
      });
    },
    { allowSignalWrites: true },
  );

  /**
   * create chart options only when date range triggers, otherwise chart is not created
   */
  chartOptionsSignal = toSignal(
    this.dateRangeControl.valueChanges.pipe(
      map((dateRange) => {
        const data = this.data();
        if (!data || !dateRange) {
          return this.initChart([]);
        }

        const { currentMinDateIndex, currentMaxDateIndex, dates } = dateRange;

        const startDate = dates[currentMinDateIndex];
        const endDate = dates[currentMaxDateIndex];

        // filter the data based on the date range
        const filteredData = data.map((d) => ({
          userBase: d.userBase,
          portfolioGrowth: d.portfolioGrowth.filter((d) => d.date >= startDate && d.date <= endDate),
        }));

        return this.initChart(filteredData);
      }),
    ),
  );

  private initChart(data: PortfolioGrowthCompareChartData[]): Highcharts.Options {
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
        type: 'datetime',
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
      series: data.map(
        (d) =>
          ({
            type: 'line',
            name: `${d.userBase.personal.displayName}`,
            data: d.portfolioGrowth.map((point) => [Date.parse(point.date), point.totalBalanceValue]),
          }) satisfies GenericChartSeries<'line'>,
      ),
    };
  }
}
