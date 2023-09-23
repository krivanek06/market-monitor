import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnterpriseValue } from '@market-monitor/api-types';
import { Recommendation } from '@market-monitor/modules/market-stocks/data-access';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { ChartConstructor } from '@market-monitor/shared/utils-client';
import { formatLargeNumber } from '@market-monitor/shared/utils-general';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-stock-enterprise-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  host: { ngSkipHydration: 'true' },
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
      *ngIf="isHighcharts"
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
    this.initChart(values);
  }
  @Input() heightPx = 400;

  private initChart(data: EnterpriseValue[]): void {
    if (!this.Highcharts) {
      return;
    }

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        zooming: {
          mouseWheel: false,
        },
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
        itemStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          cursor: 'pointer',
        },
        itemHoverStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
        },
        itemHiddenStyle: {
          color: ColorScheme.GRAY_DARK_VAR,
        },
        verticalAlign: 'top',
        align: 'right',
        layout: 'horizontal',
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
          opposite: false,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
          tickPixelInterval: 25,
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
          opposite: true,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
          tickPixelInterval: 25,
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
          color: ColorScheme.PRIMARY_VAR,
          data: data.map((d) => d.addTotalDebt),
          yAxis: 0,
          opacity: 0.7,
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
          name: 'Market Capitalization',
          color: Recommendation.Buy.color,
          data: data.map((d) => d.marketCapitalization),
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
