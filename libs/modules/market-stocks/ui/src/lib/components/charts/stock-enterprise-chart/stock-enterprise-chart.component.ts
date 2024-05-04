import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EnterpriseValue } from '@mm/api-types';
import { Recommendation } from '@mm/market-stocks/data-access';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { dateFormatDate, formatLargeNumber } from '@mm/shared/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-stock-enterprise-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <highcharts-chart
      *ngIf="isHighcharts()"
      [Highcharts]="Highcharts"
      [options]="chartOptionSignal()"
      [callbackFunction]="chartCallback"
      [style.height.px]="heightPx()"
      style="display: block; width: 100%"
    />
  `,
})
export class StockEnterpriseChartComponent extends ChartConstructor {
  data = input.required<EnterpriseValue[]>();

  chartOptionSignal = computed(() => {
    const transformedData = this.data().map((d) => ({
      ...d,
      date: dateFormatDate(d.date, 'MMMM d, y'),
    }));
    return this.initChart(transformedData);
  });

  private initChart(data: EnterpriseValue[]): Highcharts.Options {
    return {
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
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        style: {
          fontSize: '15px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        headerFormat: `<p style="color: ${ColorScheme.GRAY_DARK_VAR}; font-size: 12px">{point.x}</p><br/>`,
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
          tickPixelInterval: 25,
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
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
          tickPixelInterval: 25,
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
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
