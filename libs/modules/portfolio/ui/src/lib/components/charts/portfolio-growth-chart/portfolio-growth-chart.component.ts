import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioGrowth } from '@market-monitor/modules/portfolio/data-access';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { ChartConstructor } from '@market-monitor/shared/utils-client';
import { dateFormatDate, formatLargeNumber } from '@market-monitor/shared/utils-general';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-portfolio-growth-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
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
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGrowthChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(values: PortfolioGrowth[]) {
    this.initChart(values);
  }
  @Input() heightPx = 400;

  private initChart(data: PortfolioGrowth[]) {
    const marketTotalValue = data.map((point) => point.marketTotalValue);
    const investedValue = data.map((point) => point.investedValue);
    const dates = data.map((point) => dateFormatDate(point.date, 'MMMM d, y'));

    this.chartOptions = {
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
          gridLineColor: '#66666655',
          opposite: false,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
          tickPixelInterval: 40,
          minorGridLineWidth: 0,
          visible: true,
        },
        {
          title: {
            text: '',
          },
          startOnTick: false,
          endOnTick: false,
          gridLineColor: '#66666655',
          opposite: true,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
          tickPixelInterval: 40,
          minorGridLineWidth: 0,
          visible: true,
        },
      ],
      xAxis: {
        labels: {
          rotation: -20,
          enabled: true,
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
        categories: dates,
      },
      title: {
        text: 'Portfolio Growth',
        align: 'left',
        y: 15,
        floating: true,
        style: {
          color: '#8e8e8e',
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
        enabled: false,
        //floating: true,
        verticalAlign: 'top',
        align: 'right',
        //layout: 'vertical',
        //y: -8,
        //x: 50,
        itemStyle: {
          color: '#acacac',
          cursor: 'default',
          fontSize: '12px',
        },
        itemHoverStyle: {
          color: '#484d55',
        },
        itemHiddenStyle: {
          color: '#282828',
        },
        labelFormatter: function () {
          const that = this as any;
          return `<span style="color: ${that.color};">${that.name}</span>`;
        },
      },
      tooltip: {
        padding: 11,
        enabled: true,
        backgroundColor: '#232323',
        xDateFormat: '%A, %b %e, %Y',
        style: {
          fontSize: '16px',
          color: '#D9D8D8',
        },
        shared: true,
        headerFormat: '<p style="color:#909592; font-size: 12px">{point.key}</p><br/>',
        pointFormatter: function () {
          const that = this as any;
          const value = formatLargeNumber(that.y);

          const name = that.series.name.toLowerCase();
          const displayTextValue = that.y === 0 ? '$0' : `$${value}`;

          return `<p><span style="color: ${that.series.color}; font-weight: bold" class="capitalize">● ${name}: </span><span>${displayTextValue}</span></p><br/>`;
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
      series: [
        {
          color: ColorScheme.SUCCESS_VAR,
          type: 'line',
          zIndex: 10,
          yAxis: 1,
          // fillColor: {
          //   linearGradient: {
          //     x1: 1,
          //     y1: 0,
          //     x2: 0,
          //     y2: 1,
          //   },
          //   stops: [
          //     [0, ColorScheme.SUCCESS_VAR],
          //     [1, 'transparent'],
          //   ],
          // },
          name: 'Investment Value',
          data: investedValue,
        },
        {
          color: ColorScheme.PRIMARY_VAR,
          type: 'area',
          zIndex: 10,
          yAxis: 0,
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
      ],
    };
  }
}
