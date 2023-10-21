import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RecommendationTrends } from '@market-monitor/api-types';
import { Recommendation } from '@market-monitor/modules/market-stocks/data-access';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { ChartConstructor } from '@market-monitor/shared/utils-client';
import { dateFormatDate } from '@market-monitor/shared/utils-general';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-stock-recommendation-chart',
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
export class StockRecommendationChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(values: RecommendationTrends[]) {
    this.initChart(values);
  }

  private initChart(data: RecommendationTrends[]): void {
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
          const value = this.y;

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
        categories: data.map((rec) => dateFormatDate(rec.period, 'MMMM d, y')),
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
          },
        },
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
            color: ColorScheme.GRAY_MEDIUM_VAR,
            fontSize: '10px',
          },
        },
      },
      series: [
        {
          type: 'column',
          name: Recommendation.StrongBuy.value,
          color: Recommendation.StrongBuy.color,
          data: data.map((rec) => rec.strongBuy),
        },
        {
          type: 'column',
          name: Recommendation.Buy.value,
          color: Recommendation.Buy.color,
          data: data.map((rec) => rec.buy),
        },
        {
          type: 'column',
          name: Recommendation.Hold.value,
          color: Recommendation.Hold.color,
          data: data.map((rec) => rec.hold),
        },
        {
          type: 'column',
          name: Recommendation.Sell.value,
          color: Recommendation.Sell.color,
          data: data.map((rec) => rec.sell),
        },
        {
          type: 'column',
          name: Recommendation.StrongSell.value,
          color: Recommendation.StrongSell.color,
          data: data.map((rec) => rec.strongSell),
        },
      ],
    };
  }
}
