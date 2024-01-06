import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioGrowth } from '@market-monitor/modules/portfolio/data-access';
import { ChartConstructor, ColorScheme } from '@market-monitor/shared/data-access';
import { formatValueIntoCurrency } from '@market-monitor/shared/features/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-portfolio-change-chart',
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
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioChangeChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(input: PortfolioGrowth[]) {
    const data: number[][] = [];
    for (let i = 1; i < input.length; i++) {
      const current = input[i].totalBalanceValue;
      const before = input[i - 1].totalBalanceValue;

      data.push([Date.parse(input[i].date), current - before, (current / 100) * before]);
    }
    this.initChart(data);
  }

  private initChart(data: number[][]) {
    this.chartOptions = {
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
          gridLineColor: '#66666655',
          opposite: false,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
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
        gridLineColor: '#66666644',
        type: 'datetime',
        crosshair: true,
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
        enabled: false,
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
        },
      },
      tooltip: {
        padding: 11,
        enabled: true,
        backgroundColor: ColorScheme.GRAY_DARK_STRONG_VAR,
        xDateFormat: '%A, %b %e, %Y',
        style: {
          fontSize: '16px',
          color: ColorScheme.GRAY_LIGHT_STRONG_VAR,
        },
        shared: true,
        headerFormat: '<p style="color:#909592; font-size: 12px">{point.key}</p><br/>',
        pointFormatter: function () {
          const that = this as any;
          const isPositive = that.y >= 0;
          const color = isPositive ? ColorScheme.SUCCESS_VAR : ColorScheme.DANGER_VAR;
          const label = isPositive ? 'Profit' : 'Loss';
          const value = formatValueIntoCurrency(this.y);
          return `<span style="font-weight: bold; color: ${color}">● ${label}: </span><span>${value} </span><br/>`;
        },
      },
      series: [
        {
          zoneAxis: 'y',
          type: 'area',
          zones: [
            {
              value: 0,
              //color: '#FF0000',
              color: {
                linearGradient: { x1: 0, x2: 0, y1: 1, y2: 0 },
                stops: [
                  [0, ColorScheme.DANGER_VAR],
                  [1, 'transparent'],
                ],
              },
            },
            {
              //color: '#0d920d'
              color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, ColorScheme.SUCCESS_VAR],
                  [1, 'transparent'],
                ],
              },
            },
          ],
          data: data,
        },
      ],
    };
  }
}
