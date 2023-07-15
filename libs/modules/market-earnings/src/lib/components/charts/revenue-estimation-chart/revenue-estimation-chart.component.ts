import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartConstructor, EstimatedChartDataType } from '@market-monitor/shared-utils-client';
import { formatLargeNumber } from '@market-monitor/shared-utils-general';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-revenue-estimation-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <highcharts-chart
      [(update)]="updateFromInput"
      [Highcharts]="Highcharts"
      [callbackFunction]="chartCallback"
      [options]="chartOptions"
      [style.height.px]="heightPx"
      style="display: block; width: 100%"
    >
    </highcharts-chart>
  `,
})
export class RevenueEstimationChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(values: EstimatedChartDataType[]) {
    this.initChart(values);
  }
  @Input() heightPx = 400;
  @Input() limitValues = 30;

  private initChart(values: EstimatedChartDataType[]): void {
    const workingData = values.slice(-this.limitValues);
    const dates = workingData.map((x) => x.date);

    const epsEstSeries = workingData
      .map((x) => x.valueEst)
      .map((d) => {
        return { y: d, name: 'Expected', color: 'var(--background-dark)' };
      });

    const epsActualSeries = workingData
      .map((x) => x.valueActual)
      .map((d, index) => {
        const color = (d ?? 0) > (epsEstSeries[index]?.y ?? 0) ? 'var(--success)' : 'var(--danger)';
        return { y: d, name: 'Actual', color: color };
      });

    const epsActualSeriesLine = epsActualSeries.map((d) => ({
      ...d,
      color: 'var(--primary)',
    }));

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
      },
      title: {
        text: 'Revenue',
        align: 'left',
        style: {
          color: 'var(--gray-light)',
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
        backgroundColor: 'var(--background-dark-super)',
        style: {
          fontSize: '15px',
          color: 'var(--gray-light)',
        },
        headerFormat: '<p style="color:#909592; font-size: 12px">{point.x}</p><br/>',
        pointFormatter: function () {
          const that = this as any;
          const name = that.name;
          const value = formatLargeNumber(that.y, false, true);

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
        line: {
          dataLabels: {
            enabled: true,
            formatter: function () {
              return formatLargeNumber(this.y, false, true);
            },
            style: {
              color: 'var(--primary)',
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
            color: '#a4a4a4',
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
        categories: dates,
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
            color: 'var(--gray-light)',
            fontSize: '10px',
          },
        },
      },
      series: [
        {
          type: 'line',
          name: 'Actual',
          data: epsActualSeriesLine,
        },
        {
          type: 'column',
          name: 'Actual',
          data: epsActualSeries,
          opacity: 0.8,
          id: 'main',
        },
        {
          type: 'column',
          name: 'Expected',
          data: epsEstSeries,
          opacity: 0.8,
          linkedTo: 'main',
        },
      ],
    };
  }
}
