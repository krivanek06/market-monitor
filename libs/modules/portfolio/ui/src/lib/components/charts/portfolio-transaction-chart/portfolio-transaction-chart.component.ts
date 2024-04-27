import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PortfolioStateExecution } from '@mm/api-types';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-portfolio-transaction-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
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
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioTransactionChartComponent extends ChartConstructor {
  data = input.required<PortfolioStateExecution[]>();
  chartOptionsSignal = computed(() => this.initChart(this.data()));

  private initChart(data: PortfolioStateExecution[]): Highcharts.Options {
    return {
      chart: {
        type: 'area',
        backgroundColor: 'transparent',
        panning: {
          enabled: true,
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
        {
          title: {
            text: '',
          },
          startOnTick: false,
          endOnTick: false,
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: true,
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
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#868686',
        },
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e of %b',
        },
        labels: {
          rotation: -20,
          enabled: true,
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
      },
      title: {
        text: '',
      },
      subtitle: {
        text: '',
      },
      scrollbar: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
        verticalAlign: 'top',
        align: 'left',
        y: -8,
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
          return `<span style="color: ${this.color};">${this.name}</span>`;
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
          const value = this.series.name === 'Transaction fees' ? formatValueIntoCurrency(this.y) : this.y;
          return `<p><span style="color: ${this.series.color}; font-weight: bold">● ${this.series.name}: </span><span>${value}</span></p><br/>`;
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
      },
      series: [
        {
          color: ColorScheme.ACCENT_2_VAR,
          type: 'area',
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
          name: 'Transaction buys',
          data: data.map((point) => [Date.parse(point.date), point.numberOfExecutedBuyTransactions]),
        },
        {
          color: ColorScheme.ACCENT_3_VAR,
          type: 'area',
          fillColor: {
            linearGradient: {
              x1: 1,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, ColorScheme.ACCENT_3_VAR],
              [1, 'transparent'],
            ],
          },
          name: 'Transaction sells',
          data: data.map((point) => [Date.parse(point.date), point.numberOfExecutedSellTransactions]),
        },
        {
          name: 'Transaction fees',
          type: 'spline',
          color: ColorScheme.ACCENT_1_VAR,
          yAxis: 1,
          data: data.map((point) => [Date.parse(point.date), point.transactionFees]),
        },
      ],
    };
  }
}
