import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HistoricalPrice, SymbolHistoricalPeriods } from '@mm/api-types';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { dateFormatDate, formatLargeNumber, roundNDigits } from '@mm/shared/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-asset-price-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <highcharts-chart
      *ngIf="isHighcharts()"
      [Highcharts]="Highcharts"
      [options]="chartOptionsSignal()"
      [callbackFunction]="chartCallback"
      [style.height.px]="heightPx()"
      style="width: 100%; display: block"
    />
  `,
})
export class AssetPriceChartComponent extends ChartConstructor {
  period = input.required<SymbolHistoricalPeriods>();
  historicalPrice = input.required<HistoricalPrice[]>();
  showTitle = input(false);
  priceName = input('price');
  displayVolume = input(true);
  priceShowSign = input(true);

  chartOptionsSignal = computed(() => this.initChart(this.historicalPrice()));

  private initChart(data: HistoricalPrice[]): Highcharts.Options {
    const price = data.map((d) => d.close);
    const volume = data.map((d) => d.volume);
    const dates = data.map((d) => d.date);
    const priceNameLocal = this.priceName();
    const priceShowSignLocal = this.priceShowSign();
    const color = !!price[0] && price[0] < price[price.length - 1] ? ColorScheme.SUCCESS_VAR : ColorScheme.DANGER_VAR;

    return {
      chart: {
        animation: true,
        plotBackgroundColor: undefined,
        plotBorderWidth: undefined,
        plotShadow: false,
        backgroundColor: 'transparent',
        zooming: {
          mouseWheel: false,
        },
        panning: {
          enabled: true,
        },
      },
      yAxis: [
        {
          visible: false,
        },
        {
          title: {
            text: '',
          },
          startOnTick: false,
          endOnTick: false,
          opposite: false,
          gridLineWidth: 1,
          tickPixelInterval: 30,
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          visible: true,
          labels: {
            style: {
              color: ColorScheme.GRAY_MEDIUM_VAR,
              font: '10px Trebuchet MS, Verdana, sans-serif',
            },
          },
        },
      ],
      xAxis: {
        visible: true,
        crosshair: true,
        type: 'category',
        categories: dates.map((date) => {
          if ([SymbolHistoricalPeriods.day, SymbolHistoricalPeriods.week].includes(this.period())) {
            return dateFormatDate(date, 'HH:mm, MMMM d, y');
          }
          if (this.period() === SymbolHistoricalPeriods.month) {
            return dateFormatDate(date, 'HH:mm, MMMM d, y');
          }

          return dateFormatDate(date, 'MMMM d, y');
        }),
        labels: {
          rotation: -12,
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
      },
      title: {
        text: this.showTitle() ? 'Historical Price Chart' : '',
        align: 'left',
        style: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          fontSize: '13px',
        },
        y: 15,
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
      tooltip: {
        borderWidth: 1,
        padding: 12,
        enabled: true,
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        style: {
          fontSize: '16px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        shared: true,
        //useHTML: true,
        headerFormat: `<p style="color: ${ColorScheme.GRAY_DARK_VAR}; font-size: 12px">{point.key}</p><br/>`,

        pointFormatter: function () {
          const that = this as any;

          const castedName = that.series.name.toLowerCase();
          const isPrice = castedName === 'price';

          const value = isPrice ? roundNDigits(that.y, 2) : formatLargeNumber(that.y);
          const name = isPrice ? priceNameLocal : castedName;
          const valueFormatter = isPrice && priceShowSignLocal ? `$${value}` : `${value}`;

          // if value 0, don't show tooltip
          if (String(value) === 'N/A') {
            return '';
          }

          return `
            <p>
              <span style="color: ${that.series.color}; font-weight: bold" class="capitalize">● ${name}: </span>
              <span>${valueFormatter}</span>
            </p>
            <br/>
          `;
        },
        footerFormat: '</table>',
        valueDecimals: 2,
      },
      rangeSelector: {
        enabled: false,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          stacking: 'normal',
        },
        area: {
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, color],
              [1, 'transparent'],
            ],
          },
          lineColor: color,
          marker: {
            radius: 3,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 2,
            },
          },
          threshold: null,
        },
        series: {
          borderWidth: 0,
          enableMouseTracking: true,
        },
      },
      series: [
        {
          type: 'area',
          name: 'Price',
          data: price,
          yAxis: 1,
          color: color,
        },
        {
          type: 'column',
          name: 'Volume',
          data: this.displayVolume() ? volume : [],
          color: '#f48605',
          yAxis: 0,
          opacity: 0.6,
        },
      ],
    };
  }
}
