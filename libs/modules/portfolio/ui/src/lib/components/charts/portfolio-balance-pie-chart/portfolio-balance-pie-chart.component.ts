import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PortfolioState } from '@mm/api-types';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-portfolio-balance-pie-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
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
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioBalancePieChartComponent extends ChartConstructor {
  readonly dataLabelsEnabled = input(true);
  readonly data = input.required<PortfolioState>();

  readonly chartOptionSignal = computed(() => this.initChart(this.data()));

  private initChart(data: PortfolioState): Highcharts.Options {
    return {
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
        style: {
          color: ColorScheme.GRAY_DARK_VAR,
          fontSize: '18px',
        },
        text: formatValueIntoCurrency(data.balance),
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
            enabled: this.dataLabelsEnabled(),
            crop: false,
            style: {
              //fontWeight: 'bold',
              fontSize: '14px',
              textOutline: 'transparent',
            },
            formatter: function () {
              const result = `
                  <div style="color: ${ColorScheme.GRAY_DARK_VAR}">${this.key}</div>
                `;
              return result;
            },
          },
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
        headerFormat: '',
        pointFormatter: function () {
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
