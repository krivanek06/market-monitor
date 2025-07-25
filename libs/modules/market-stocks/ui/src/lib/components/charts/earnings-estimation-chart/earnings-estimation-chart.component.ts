import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartConstructor, ColorScheme, EstimatedChartDataType } from '@mm/shared/data-access';
import { dateFormatDate, roundNDigits } from '@mm/shared/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-earnings-estimation-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <highcharts-chart
      *ngIf="isHighcharts()"
      [Highcharts]="Highcharts"
      [options]="chartOptionsSignal()"
      [callbackFunction]="chartCallback"
      [style.height.px]="heightPx()"
      style="display: block; width: 100%"
    />
  `,
})
export class EarningsEstimationChartComponent extends ChartConstructor {
  data = input.required<EstimatedChartDataType[]>();
  limitValues = input(30);
  showTitle = input(false);

  chartOptionsSignal = computed(() => this.initChart(this.data()));

  private initChart(values: EstimatedChartDataType[]): Highcharts.Options {
    const workingData = values.slice(-this.limitValues());
    const dates = workingData.map((x) => x.date);

    const epsEstSeries = workingData
      .map((x) => x.valueEst)
      .map((d) => {
        return { y: d, z: 25, name: 'Expected', color: ColorScheme.GRAY_MEDIUM_VAR };
      });

    const epsActualSeries = workingData
      .map((x) => x.valueActual)
      .map((d, index) => {
        const color = (d ?? -99) > (epsEstSeries[index]?.y ?? -99) ? ColorScheme.SUCCESS_VAR : ColorScheme.DANGER_VAR;
        return { y: d, z: 25, name: 'Actual', color: color };
      });

    const epsActualSeriesLine = epsActualSeries.map((d) => ({
      ...d,
      color: 'var(--primary)',
    }));

    return {
      chart: {
        type: 'bubble',
        backgroundColor: 'transparent',
        zooming: {
          mouseWheel: false,
        },
      },
      title: {
        text: this.showTitle() ? 'Earnings' : '',
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
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        style: {
          fontSize: '15px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        headerFormat: `<p style="color: ${ColorScheme.GRAY_DARK_VAR}; font-size: 12px">{point.x}</p><br/>`,
        pointFormatter: function () {
          const that = this as any;
          const name = that.name;
          const value = roundNDigits(that.y, 2);

          return `
            <p>
              <span style="color: ${that.color}; font-weight: bold" class="capitalize">● ${name}: </span>
              <span>${value}</span>
            </p><br/>
          `;
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        bubble: {
          minSize: 12,
          maxSize: 30,
          enableMouseTracking: true,
        },
        line: {
          dataLabels: {
            enabled: true,
            formatter: function () {
              return roundNDigits(this.y, 2);
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
        tickPixelInterval: 25,
        visible: true,
        gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
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
          data: epsActualSeriesLine,
          opacity: 0.75,
          enableMouseTracking: true,
        },
        {
          type: 'bubble',
          name: 'Actual',
          data: epsActualSeries,
          opacity: 0.7,
          // marker: {
          //   fillColor: 'var(--background-medium)',
          // },
        },
        {
          type: 'bubble',
          name: 'Expected',
          data: epsEstSeries,
          opacity: 0.6,
          marker: {
            fillColor: ColorScheme.GRAY_MEDIUM_VAR,
          },
        },
      ],
    };
  }
}
