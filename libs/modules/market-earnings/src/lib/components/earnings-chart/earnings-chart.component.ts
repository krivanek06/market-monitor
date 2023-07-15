import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ChartConstructor } from '@market-monitor/shared-utils-client';
import { HighchartsChartModule } from 'highcharts-angular';
//import HighchartsMoreModule from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts';
// HighchartsMoreModule(Highcharts);
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
  @Input() heightPx = 400;
  ngOnInit(): void {
    this.initChart();
  }

  private initChart(): void {
    this.chartOptions = {
      chart: {
        type: 'bubble',
        backgroundColor: 'transparent',
      },
      title: {
        text: 'Earnings',
        align: 'left',
        style: {
          color: '#bababa',
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
          fontSize: '12px',
          color: '#D9D8D8',
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
        itemStyle: {
          color: '#8f8f8f',
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
        categories: [],
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
            fontSize: '10px',
          },
        },
      },
      series: [
        {
          type: 'bubble',
          name: 'Expected',
          data: [
            { y: 3, z: 3, name: 'Expected', color: '#499d89' },
            { y: 6, z: 3, name: 'Expected', color: '#499d89' },
          ],
          // marker: {
          //   fillColor: '#9d9d9d',
          // },
        },
        {
          type: 'bubble',
          name: 'Actual',
          data: [
            { y: 6, z: 3, name: 'Expected', color: '#499d89' },
            { y: 8, z: 3, name: 'Expected', color: '#499d89' },
          ],
        },
        // {
        // 	name: 'Actual',
        // 	data: this.actualEarnings.map((x) => {
        // 		return { y: x?.y, z: 3, name: 'Actual', color: x.color };
        // 	}),
        // },
      ],
    };
  }
}
