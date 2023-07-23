import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnterpriseValue } from '@market-monitor/api-types';
import { ChartConstructor, ColorScheme } from '@market-monitor/shared-utils-client';
import { formatLargeNumber } from '@market-monitor/shared-utils-general';
import { HighchartsChartModule } from 'highcharts-angular';
import { Recommendation } from '../../../models';

@Component({
  selector: 'app-stock-enterprise-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
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
export class StockEnterpriseChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(values: EnterpriseValue[]) {
    this.initChart(values.reverse());
  }
  @Input() heightPx = 400;

  private initChart(data: EnterpriseValue[]): void {
    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
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
          const name = this.series.name;
          const value = formatLargeNumber(this.y, false, false);

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
      xAxis: {
        labels: {
          rotation: -20,
          enabled: true,
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
        categories: data.map((d) => d.date),
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: false,
          },
        },
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
          minorTickInterval: 'auto',
          tickPixelInterval: 25,
          visible: true,
          gridLineColor: '#66666655',
          labels: {
            style: {
              color: ColorScheme.GRAY_MEDIUM_VAR,
              fontSize: '10px',
            },
          },
        },
        {
          title: {
            text: '',
          },
          startOnTick: false,
          endOnTick: false,
          opposite: true,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
          tickPixelInterval: 25,
          visible: true,
          gridLineColor: '#66666655',
          labels: {
            style: {
              color: ColorScheme.GRAY_MEDIUM_VAR,
              fontSize: '10px',
            },
          },
        },
        {
          visible: false,
        },
      ],
      series: [
        {
          type: 'column',
          name: 'Total Debt',
          data: data.map((d) => d.addTotalDebt),
          yAxis: 0,
          opacity: 0.85,
        },
        {
          type: 'line',
          name: 'Enterprise Value',
          color: Recommendation.StrongBuy.color,
          data: data.map((d) => d.enterpriseValue),
          yAxis: 1,
        },
        {
          type: 'line',
          name: 'Total Shares',
          color: Recommendation.Hold.color,
          data: data.map((d) => d.numberOfShares),
          yAxis: 2,
        },
      ],
    };
  }
}
