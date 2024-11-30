import { ChangeDetectionStrategy, Component, effect, input, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PortfolioGrowth, USER_DEFAULT_STARTING_CASH } from '@mm/api-types';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  filterDataByDateRange,
  filterDataByIndexRange,
} from '@mm/shared/ui';
import { format } from 'date-fns';
import { SeriesOptionsType } from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { map } from 'rxjs';

@Component({
  selector: 'app-portfolio-growth-chart',
  standalone: true,
  imports: [HighchartsChartModule, DateRangeSliderComponent, ReactiveFormsModule],
  template: `
    @if (displayHeader()) {
      <div class="flex flex-col items-center justify-between gap-x-3 sm:flex-row">
        <!-- select chart title -->
        <div class="text-wt-primary text-lg">{{ headerTitle() }}</div>

        <!-- date range -->
        @if ((data()?.values ?? []).length > 4) {
          <app-date-range-slider
            class="w-full max-sm:px-4 sm:w-[450px]"
            [formControl]="sliderControl"
            [filterType]="filterType()"
          />
        }
      </div>
    }

    <!-- chart -->
    @if ((chartOptionsSignal().series?.length ?? 0) > 0) {
      @if (isHighcharts()) {
        <highcharts-chart
          [Highcharts]="Highcharts"
          [options]="chartOptionsSignal()"
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
export class PortfolioGrowthChartComponent extends ChartConstructor {
  readonly headerTitle = input<string>('');
  readonly data = input<{
    values: PortfolioGrowth[] | null;
    currentCash?: number[];
  }>();

  readonly startCash = input(USER_DEFAULT_STARTING_CASH);
  readonly displayLegend = input(false);
  readonly displayHeader = input(true);
  readonly displayThreshold = input(true);
  readonly chartType = input<'all' | 'marketValue' | 'balance'>('all');

  /**
   * type of filter to use to compare date value
   * - date - compare by date
   * - round - compare by normal <= >= etc
   */
  readonly filterType = input<'date' | 'round'>('date');

  readonly sliderControl = new FormControl<DateRangeSliderValues>(
    {
      currentMaxDateIndex: 0,
      currentMinDateIndex: 0,
      dates: [],
    },
    { nonNullable: true },
  );

  readonly initSliderEffect = effect(() => {
    const dataValues = this.data();
    const values = dataValues?.values ?? [];

    // create slider values
    const sliderValuesInput: DateRangeSliderValues = {
      dates: values.map((point) => point.date),
      currentMinDateIndex: 0,
      currentMaxDateIndex: values.length - 1,
    };

    untracked(() => this.sliderControl.patchValue(sliderValuesInput));
  });

  readonly chartOptionsSignal = toSignal(
    this.sliderControl.valueChanges.pipe(
      map((sliderValues) => {
        const dataValues = this.data();
        const startCash = this.startCash();
        const filterType = this.filterType();
        const displayHeader = this.displayHeader();
        const isDate = filterType === 'date';

        // filter out by valid dates
        const compareFn = isDate ? filterDataByDateRange : filterDataByIndexRange;
        const inputValues = displayHeader
          ? compareFn(dataValues?.values ?? [], sliderValues)
          : (dataValues?.values ?? []);

        // filter out current cash values
        const currentCash = (dataValues?.currentCash ?? []).slice(
          sliderValues.currentMinDateIndex,
          sliderValues.currentMaxDateIndex + 1,
        );
        // create series data
        const seriesDataUpdate = this.createChartSeries(inputValues, currentCash, startCash);

        // create categories
        const categories = isDate
          ? inputValues.map((d) => format(d.date, 'EEEE, MMM d, y'))
          : inputValues.map((d) => `Round ${d.date}`);

        // create chart
        return this.initChart(seriesDataUpdate, categories);
      }),
    ),
    { initialValue: this.initChart([], []) },
  );

  private initChart(data: SeriesOptionsType[], categories: string[]): Highcharts.Options {
    return {
      chart: {
        type: 'area',
        backgroundColor: 'transparent',
        panning: {
          enabled: true,
        },
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
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: false,
          gridLineWidth: 1,
          tickPixelInterval: 30,
          minorGridLineWidth: 0,
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
        labels: {
          rotation: -20,
          enabled: true,
          format: '{value:%b %e. %Y}',
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
        type: 'category',
        categories: categories,
      },
      title: {
        text: '',
        align: 'left',
        y: 0,
        floating: true,
        style: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          fontSize: '13px',
        },
      },
      subtitle: undefined,
      scrollbar: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: this.displayLegend() || this.chartType() === 'all',
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
        area: {
          marker: {
            enabled: true,
            radius: 3,
          },
          lineWidth: 2,
          states: {
            hover: {
              lineWidth: 4,
            },
          },
          threshold: null,
        },
        series: {
          borderWidth: 2,
          enableMouseTracking: true,
          // events: {
          // 	legendItemClick: function () {
          // 		return false;
          // 	},
          // },
        },
      },
      series: data,
    };
  }

  private createChartSeries(data: PortfolioGrowth[], currentCash: number[], startingCash: number): SeriesOptionsType[] {
    const marketTotalValue = data.map((point) => [point.marketTotal]);
    const breakEvenValue = data.map((point) => [point.investedTotal]);
    const balanceTotal = data.map((point) => [point.balanceTotal]);
    const threshold = data.map((point, index) => [currentCash.at(index) ?? startingCash]);

    // get points when investment value change from previous day
    const investmentChangePoints: [number, number][] = [];
    for (let i = 0; i < data.length; i++) {
      const curr = data[i];
      const prev = data[i - 1];
      if (prev && prev.investedTotal !== curr.investedTotal) {
        investmentChangePoints.push([new Date(curr.date).getTime(), curr.investedTotal]);
      }
    }

    return [
      {
        color: ColorScheme.ACCENT_1_VAR,
        type: 'area',
        zIndex: 10,
        yAxis: 0,
        visible: this.chartType() === 'all' || this.chartType() === 'balance',
        fillColor: {
          linearGradient: {
            x1: 1,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, ColorScheme.ACCENT_1_VAR],
            [1, 'transparent'],
          ],
        },
        name: 'Total Balance',
        data: balanceTotal,
      },
      {
        color: ColorScheme.PRIMARY_VAR,
        type: 'area',
        zIndex: 10,
        yAxis: 0,
        opacity: 0.65,
        visible: this.chartType() === 'all' || this.chartType() === 'marketValue',
        showInLegend: true,
        fillColor: {
          linearGradient: {
            x1: 1,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, ColorScheme.PRIMARY_VAR],
            [1, 'transparent'],
          ],
        },
        name: 'Market Value',
        data: marketTotalValue,
      },
      // {
      //   color: ColorScheme.PRIMARY_VAR,
      //   type: 'column',
      //   zIndex: 10,
      //   yAxis: 0,
      //   opacity: 0.8,
      //   visible: !isCashActive,
      //   showInLegend: !isCashActive,
      //   name: 'Investment Value Change',
      //   data: investmentChangePoints,
      // },
      {
        color: ColorScheme.ACCENT_2_VAR,
        type: 'area',
        zIndex: 10,
        yAxis: 0,
        opacity: 0.2,
        visible: this.chartType() === 'all' || this.chartType() === 'marketValue',
        showInLegend: true,
        fillColor: {
          linearGradient: {
            x1: 1,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, ColorScheme.ACCENT_2_VAR],
            [1, 'transparent'],
          ],
        },
        name: 'Investment Value',
        data: breakEvenValue,
      },
      {
        color: ColorScheme.DANGER_VAR,
        type: 'area',
        zIndex: 10,
        yAxis: 0,
        opacity: 0.3,
        visible: (this.chartType() === 'all' || this.chartType() === 'balance') && this.displayThreshold(),
        showInLegend: true,
        fillColor: {
          linearGradient: {
            x1: 1,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, ColorScheme.DANGER_VAR],
            [1, 'transparent'],
          ],
        },
        name: 'Threshold',
        data: threshold,
      },
    ];
  }
}
