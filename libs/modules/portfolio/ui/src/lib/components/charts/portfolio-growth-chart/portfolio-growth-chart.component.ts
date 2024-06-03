import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PortfolioGrowth } from '@mm/portfolio/data-access';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  SectionTitleComponent,
  filterDataByDateRange,
} from '@mm/shared/ui';
import { SeriesOptionsType } from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { map } from 'rxjs';

@Component({
  selector: 'app-portfolio-growth-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, DateRangeSliderComponent, ReactiveFormsModule, SectionTitleComponent],
  template: `
    <div class="flex flex-col items-center justify-between gap-3 lg:flex-row">
      <!-- select chart title -->
      <app-section-title [title]="headerTitle()" />

      <!-- date range -->
      <app-date-range-slider
        *ngIf="data().values.length > 0"
        class="w-full lg:w-[550px]"
        [formControl]="sliderControl"
      />
    </div>

    <!-- chart -->
    @if ((chartOptionsSignal().series?.length ?? 0) > 0) {
      <highcharts-chart
        *ngIf="isHighcharts()"
        [Highcharts]="Highcharts"
        [options]="chartOptionsSignal()"
        [callbackFunction]="chartCallback"
        [style.height.px]="heightPx()"
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
export class PortfolioGrowthChartComponent extends ChartConstructor {
  headerTitle = input<string>('');
  data = input.required<{
    values: PortfolioGrowth[];
    startingCashValue: number;
  }>();
  displayLegend = input(false);
  chartType = input<'all' | 'marketValue' | 'balance'>('all');

  sliderControl = new FormControl<DateRangeSliderValues>(
    {
      currentMaxDateIndex: 0,
      currentMinDateIndex: 0,
      dates: [],
    },
    { nonNullable: true },
  );

  initSliderEffect = effect(
    () => {
      const dataValues = this.data();

      // create slider values
      const sliderValuesInput: DateRangeSliderValues = {
        dates: dataValues.values.map((point) => point.date),
        currentMinDateIndex: 0,
        currentMaxDateIndex: dataValues.values.length - 1,
      };
      this.sliderControl.patchValue(sliderValuesInput);
    },
    { allowSignalWrites: true },
  );

  chartOptionsSignal = toSignal(
    this.sliderControl.valueChanges.pipe(
      map((sliderValues) => {
        const dataValues = this.data();

        // filter out by valid dates
        const inputValues = filterDataByDateRange(dataValues.values, sliderValues);
        const seriesDataUpdate = this.createChartSeries(inputValues, dataValues.startingCashValue);

        // create chart
        return this.initChart(seriesDataUpdate);
      }),
    ),
    { initialValue: this.initChart([]) },
  );

  private initChart(data: SeriesOptionsType[]): Highcharts.Options {
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
        type: 'datetime',
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

  private createChartSeries(data: PortfolioGrowth[], startingCashValue: number = 0): SeriesOptionsType[] {
    const marketTotalValue = data.map((point) => [new Date(point.date).getTime(), point.marketTotalValue]);
    const breakEvenValue = data.map((point) => [new Date(point.date).getTime(), point.breakEvenValue]);

    //  const dates = data.map((point) => dateFormatDate(point.date, 'MMMM d, y'));
    const totalBalanceValues = data.map((point) => [new Date(point.date).getTime(), point.totalBalanceValue]);
    const threshold = data.map((point) => [new Date(point.date).getTime(), startingCashValue ?? 0]);

    // get points when investment value change from previous day
    const investmentChangePoints: [number, number][] = [];
    for (let i = 0; i < data.length; i++) {
      const curr = data[i];
      const prev = data[i - 1];
      if (prev && prev.breakEvenValue !== curr.breakEvenValue) {
        investmentChangePoints.push([new Date(curr.date).getTime(), curr.breakEvenValue]);
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
        data: totalBalanceValues,
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
        opacity: 0.45,
        visible: (this.chartType() === 'all' || this.chartType() === 'balance') && startingCashValue > 0,
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
