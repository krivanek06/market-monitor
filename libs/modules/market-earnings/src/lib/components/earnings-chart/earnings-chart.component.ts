import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ChartConstructor, EstimatedChartDataType } from '@market-monitor/shared-utils-client';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import HC_more from 'highcharts/highcharts-more';

HC_more(Highcharts);

@Component({
  selector: 'app-earnings-chart',
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
export class EarningsChartComponent extends ChartConstructor implements OnInit {
  @Input({ required: true }) data!: EstimatedChartDataType[];
  @Input() heightPx = 400;

  ngOnInit(): void {
    this.initChart();
  }

  private initChart(): void {
    const limitValues = 30;
    const workingData = this.data.slice(-limitValues);
    const dates = workingData.map((x) => x.date);

    const epsEstSeries = workingData
      .map((x) => x.valueEst)
      .map((d) => {
        return { y: d, z: 25, name: 'Expected', color: 'var(--background-dark)' };
      });

    const epsActualSeries = workingData
      .map((x) => x.valueActual)
      .map((d, index) => {
        const color = (d ?? -99) > (epsEstSeries[index]?.y ?? -99) ? 'var(--success)' : 'var(--danger)';
        return { y: d, z: 25, name: 'Actual', color: color };
      });

    console.log(dates, epsEstSeries, epsActualSeries);

    this.chartOptions = {
      chart: {
        type: 'bubble',
        backgroundColor: 'transparent',
      },
      title: {
        text: 'Earnings',
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
          const value = that.y;

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
        tickPixelInterval: 25,
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
          type: 'bubble',
          name: 'Expected',
          data: epsEstSeries,
          opacity: 0.7,
          marker: {
            fillColor: 'var(--background-medium)',
          },
        },
        {
          type: 'bubble',
          name: 'Actual',
          data: epsActualSeries,
          opacity: 0.6,
          // marker: {
          //   fillColor: 'var(--background-medium)',
          // },
        },
      ],
    };
  }
}
