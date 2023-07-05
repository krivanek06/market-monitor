import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HistoricalPrice } from '@market-monitor/api-types';
import { ChartConstructor, ColorScheme, GeneralFunctionUtil } from '@market-monitor/shared-utils-client';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-asset-price-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <highcharts-chart
      *ngIf="isHighcharts"
      [Highcharts]="Highcharts"
      [options]="chartOptions"
      [callbackFunction]="chartCallback"
      style="width: 100%; display: block"
      [style.height.px]="heightPx"
    >
    </highcharts-chart>
  `,
})
export class AssetPriceChartComponent extends ChartConstructor implements OnInit, OnChanges {
  @Input() heightPx = 550;
  @Input() historicalPrice!: HistoricalPrice[];
  @Input() showTitle = false;
  @Input() priceName = 'price';
  @Input() displayVolume = true;
  @Input() priceShowSign = true;

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    const price = changes?.['historicalPrice'];

    if (price && price?.currentValue) {
      this.initChart(price.currentValue);
    }
  }

  private initChart(data: HistoricalPrice[]) {
    const price = data.map((d) => d.close);
    const volume = data.map((d) => d.volume);
    const dates = data.map((d) => d.date);
    const priceNameLocal = this.priceName;
    const priceShowSignLocal = this.priceShowSign;
    const color = !!price[0] && price[0] < price[price.length - 1] ? ColorScheme.SUCCESS_VAR : ColorScheme.DANGER_VAR;

    console.log({ price, volume, dates });

    this.chartOptions = {
      chart: {
        plotBackgroundColor: undefined,
        plotBorderWidth: undefined,
        plotShadow: false,
        backgroundColor: 'transparent',
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
          gridLineColor: '#66666644',
          opposite: false,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
          tickPixelInterval: 40,
          minorGridLineWidth: 0,
          visible: true,
          labels: {
            style: {
              color: ColorScheme.GRAY_LIGHT_VAR,
              font: '10px Trebuchet MS, Verdana, sans-serif',
            },
          },
        },
      ],
      xAxis: {
        visible: true,
        crosshair: true,
        type: 'category',
        categories: dates,
        gridLineColor: '#66666644',
        labels: {
          rotation: -12,
          style: {
            color: ColorScheme.GRAY_LIGHT_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
      },
      title: {
        text: this.showTitle ? 'Historical Price Chart' : '',
        align: 'left',
        style: {
          color: '#bababa',
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
        backgroundColor: '#232323',
        style: {
          fontSize: '16px',
          color: '#D9D8D8',
        },
        shared: true,
        //useHTML: true,
        headerFormat: '<p style="color:#909592; font-size: 12px">{point.key}</p><br/>',

        pointFormatter: function () {
          const that = this as any;

          const castedName = that.series.name.toLowerCase();
          const isPrice = castedName === 'price';

          const value = isPrice
            ? GeneralFunctionUtil.roundNDigits(that.y, 2)
            : GeneralFunctionUtil.formatLargeNumber(that.y);
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
          data: this.displayVolume ? volume : [],
          color: '#f48605',
          yAxis: 0,
          opacity: 0.6,
        },
      ],
    };
  }
}
