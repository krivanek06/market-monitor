import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartConstructor, ColorScheme, EstimatedChartDataType } from '@mm/shared/data-access';
import { dateFormatDate, formatLargeNumber } from '@mm/shared/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-revenue-estimation-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { ngSkipHydration: 'true' },
  template: `
    <highcharts-chart
      *ngIf="isHighcharts"
      [Highcharts]="Highcharts"
      [options]="chartOptionSignal()"
      [callbackFunction]="chartCallback"
      [style.height.px]="heightPx()"
      style="display: block; width: 100%"
    />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class RevenueEstimationChartComponent extends ChartConstructor {
  data = input.required<EstimatedChartDataType[]>();
  limitValues = input(30);
  showTitle = input(false);

  chartOptionSignal = computed(() => this.initChart(this.data()));

  private initChart(values: EstimatedChartDataType[]): Highcharts.Options {
    const workingData = values.slice(-this.limitValues());
    const dates = workingData.map((x) => x.date);

    const revenueEstSeries = workingData
      .map((x) => x.valueEst)
      .map((d) => {
        return { y: d, name: 'Expected', color: ColorScheme.GRAY_MEDIUM_VAR };
      });

    const revenueActualSeries = workingData
      .map((x) => x.valueActual)
      .map((d, index) => {
        const color = (d ?? 0) > (revenueEstSeries[index]?.y ?? 0) ? ColorScheme.SUCCESS_VAR : ColorScheme.DANGER_VAR;
        return { y: d, name: 'Actual', color: color };
      });

    const revenueActualSeriesLine = revenueActualSeries.map((d) => ({
      ...d,
      color: ColorScheme.PRIMARY_VAR,
    }));

    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        zooming: {
          mouseWheel: false,
        },
      },
      title: {
        text: this.showTitle() ? 'Revenue' : '',
        align: 'left',
        style: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          fontSize: '12px',
        },
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        padding: 12,
        borderWidth: 1,
        enabled: true,
        shared: true,
        backgroundColor: ColorScheme.GRAY_DARK_STRONG_VAR,
        style: {
          fontSize: '15px',
          color: ColorScheme.GRAY_LIGHT_STRONG_VAR,
        },
        headerFormat: `<p style="color: ${ColorScheme.GRAY_LIGHT_STRONG_VAR}; font-size: 12px">{point.x}</p><br/>`,
        pointFormatter: function () {
          const name = this.name;
          const value = formatLargeNumber(this.y, false, true);

          return `
            <p>
              <span style="color: ${this.color}; font-weight: bold" class="capitalize">● ${name}: </span>
              <span>${value}</span>
            </p><br/>
          `;
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
            formatter: function () {
              return formatLargeNumber(this.y, false, true);
            },
            style: {
              color: ColorScheme.PRIMARY_VAR,
              fontWeight: 'normal',
              fontSize: '12px',
              textOutline: '0px',
            },
          },
          marker: {
            radius: 3,
          },
          lineWidth: 2,
          states: {
            hover: {
              lineWidth: 3,
            },
          },
        },
      },
      xAxis: {
        labels: {
          rotation: -20,
          enabled: true,
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
        categories: dates.map((date) => {
          return dateFormatDate(date, 'MMMM d, y');
        }),
      },
      yAxis: {
        title: {
          text: '',
        },
        startOnTick: false,
        endOnTick: false,
        opposite: false,
        gridLineWidth: 1,
        minorTickInterval: 'auto',
        tickPixelInterval: 30,
        visible: true,
        gridLineColor: '#66666655',
        labels: {
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            fontSize: '10px',
          },
        },
      },
      series: [
        {
          type: 'line',
          name: 'Actual',
          data: revenueActualSeriesLine,
          opacity: 0.7,
          enableMouseTracking: false,
        },
        {
          type: 'column',
          name: 'Actual',
          data: revenueActualSeries,
          opacity: 0.8,
          id: 'main',
        },
        {
          type: 'column',
          name: 'Expected',
          data: revenueEstSeries,
          opacity: 0.8,
          linkedTo: 'main',
        },
      ],
    };
  }
}
