import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioState } from '@market-monitor/api-types';
import { ChartConstructor, ColorScheme } from '@market-monitor/shared/data-access';
import { formatValueIntoCurrency } from '@market-monitor/shared/features/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-portfolio-balance-pie-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  template: `
    <highcharts-chart
      *ngIf="isHighcharts"
      [(update)]="updateFromInput"
      [Highcharts]="Highcharts"
      [callbackFunction]="chartCallback"
      [options]="chartOptions"
      [style.height.px]="heightPx()"
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
export class PortfolioBalancePieChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(input: PortfolioState) {
    this.initChart(input);
  }

  private initChart(data: PortfolioState) {
    this.chartOptions = {
      chart: {
        type: 'pie',
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
      title: {
        text: '',
      },
      subtitle: {
        useHTML: true,
        floating: true,
        verticalAlign: 'middle',
        y: 15,
        text: `
          <div style="font-size: 18px">${formatValueIntoCurrency(data.balance)}</div>

        `,
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
        pie: {
          borderWidth: 0,
          size: '100%',
          innerSize: '80%',
          dataLabels: {
            enabled: true,
            crop: false,
            style: {
              //fontWeight: 'bold',
              fontSize: '14px',
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
        headerFormat: '',
        pointFormatter: function () {
          const that = this as any;
          const value = formatValueIntoCurrency(this.y);
          return `<span style="font-weight: bold; color: ${this.color}">● ${this.name}: </span><span>${value} </span><br/>`;
        },
      },
      series: [
        {
          type: 'pie',
          data: [
            {
              name: 'Cash',
              y: data.cashOnHand,
              color: ColorScheme.ACCENT_2_VAR,
            },
            {
              name: 'Invested',
              y: data.holdingsBalance,
              color: ColorScheme.ACCENT_1_VAR,
            },
          ],
        },
      ],
    };
  }
}
