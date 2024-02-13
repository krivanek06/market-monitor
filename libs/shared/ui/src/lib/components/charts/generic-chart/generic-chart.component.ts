import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartConstructor, ColorScheme, GenericChartSeries } from '@market-monitor/shared/data-access';
import { formatLargeNumber, formatValueIntoCurrency, roundNDigits } from '@market-monitor/shared/features/general-util';
import { format } from 'date-fns';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';

type ChartInputType = Highcharts.SeriesOptionsType[];

@Component({
  selector: 'app-generic-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, MatButtonModule, MatIconModule, MatTooltipModule],
  host: { ngSkipHydration: 'true' },
  styles: `
      :host {
        display: block;
      }
  `,
  template: `
    <div class="block relative">
      <button
        mat-icon-button
        *ngIf="showExpandableButton"
        class="text-wt-gray-medium hover:text-wt-gray-medium z-10 absolute right-0 top-0"
        (click)="expand()"
        matTooltip="Expand chart"
      >
        <mat-icon>open_with</mat-icon>
      </button>

      <highcharts-chart
        *ngIf="isHighcharts"
        [Highcharts]="Highcharts"
        [options]="chartOptions"
        [callbackFunction]="chartCallback"
        [(update)]="updateFromInput"
        [oneToOne]="true"
        style="width: 100%; display: block"
        [style.height.px]="heightPx"
      >
      </highcharts-chart>
    </div>
  `,
})
export class GenericChartComponent<T extends Highcharts.SeriesOptionsType['type']>
  extends ChartConstructor
  implements OnChanges, OnDestroy
{
  @Output() expandEmitter = new EventEmitter<any>();

  @Input({ required: true }) series!: GenericChartSeries<T>[];

  @Input() chartType: Highcharts.SeriesOptionsType['type'] = 'line';
  @Input() chartTitle = '';
  @Input() chartTitlePosition: Highcharts.AlignValue = 'left';
  @Input() enableZoom = false;
  @Input() showTooltip = true;
  @Input() showDataLabel = false;
  @Input() categories: string[] = [];
  @Input() showYAxis = true;
  @Input() showXAxis = true;
  @Input() shareTooltip = true;
  @Input() showTooltipHeader = true;

  // legend
  @Input() showLegend = false;
  @Input() enableLegendTogging = false;
  @Input() showLegendLatestValue = false;
  @Input() legendAlign: 'left' | 'center' | 'right' = 'left';
  @Input() legentLayout: 'vertical' | 'horizontal' = 'horizontal';
  @Input() legendVerticalAlign: 'top' | 'middle' | 'bottom' = 'top';
  @Input() floatingLegend = false;

  @Input() showExpandableButton = false;
  @Input() applyFancyColor = 0;
  @Input() isCategoryDates = false;

  constructor() {
    super();
  }
  ngOnDestroy(): void {
    console.log('GenericChartComponent: ngOnDestroy()');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.Highcharts || this.platform.isServer) {
      return;
    }

    if (this.applyFancyColor > 0) {
      this.fancyColoring();
    }

    let series = this.series;

    this.initChart(series);

    if (this.floatingLegend && this.chartOptions.legend) {
      this.chartOptions.legend.floating = true;
      this.chartOptions.legend.layout = 'vertical';
      this.chartOptions.legend.x = -150;
      this.chartOptions.legend.y = 10;
      this.chartOptions.legend.align = 'center';
      this.chartOptions.legend.verticalAlign = 'middle';
    }

    if (this.chartType === 'column' && this.chartOptions.xAxis) {
      this.chartOptions.xAxis = {
        ...this.chartOptions.xAxis,
        type: 'category',
      };
    } else if (this.chartType === 'column' && this.chartOptions.xAxis) {
      this.chartOptions.xAxis = {
        ...this.chartOptions.xAxis,
        type: 'category',
      };
    } else if (this.chartType === 'area') {
      this.initAreaChange();
    }

    if (this.categories.length > 0) {
      this.initCategories();
    }
  }

  expand() {
    this.expandEmitter.emit();
  }

  private initCategories() {
    //this.chartOptions.plotOptions!.series!.dataLabels!. = false;
    if (this.chartOptions.xAxis) {
      this.chartOptions.xAxis = {
        ...this.chartOptions.xAxis,
        categories: this.isCategoryDates
          ? this.categories.map((d) => format(new Date(d), 'MMM dd, yyyy'))
          : this.categories,
        type: 'category',
      };
    }
  }

  private initChart(series: ChartInputType) {
    this.chartOptions = {
      chart: {
        type: this.chartType,
        backgroundColor: 'transparent',
        // zooming: {
        //   type: 'x',
        //   key: 'shift',
        //   mouseWheel: this.enableZoom,
        // },
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
          //minorGridLineWidth: 0, // gray-ish grid lines
          visible: this.showYAxis,
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
          gridLineColor: '#66666655',
          opposite: true,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
          tickPixelInterval: 30,
          //minorGridLineWidth: 0, // gray-ish grid lines
          visible: this.showYAxis,
          labels: {
            style: {
              color: ColorScheme.GRAY_MEDIUM_VAR,
              font: '10px Trebuchet MS, Verdana, sans-serif',
            },
          },
        },
      ],
      xAxis: {
        visible: this.showXAxis,
        crosshair: true,
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
        text: this.chartTitle,
        align: this.chartTitlePosition,
        style: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          fontSize: '13px',
          fontWeight: 'normal',
        },
        y: 10,
      },
      subtitle: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: this.showLegend,
        itemStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          cursor: this.enableLegendTogging ? 'pointer' : 'default',
        },
        itemHoverStyle: {
          color: this.enableLegendTogging ? ColorScheme.GRAY_MEDIUM_VAR : ColorScheme.GRAY_MEDIUM_VAR,
        },
        itemHiddenStyle: {
          color: this.enableLegendTogging ? ColorScheme.GRAY_DARK_VAR : ColorScheme.GRAY_MEDIUM_VAR,
        },
        verticalAlign: this.legendVerticalAlign,
        align: this.legendAlign,
        layout: this.legentLayout,
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      tooltip: {
        borderWidth: 1,
        padding: 12,
        backgroundColor: ColorScheme.GRAY_DARK_STRONG_VAR,
        style: {
          fontSize: '15px',
          color: ColorScheme.GRAY_LIGHT_STRONG_VAR,
        },
        shared: this.shareTooltip,
        outside: false,
        useHTML: true,
        xDateFormat: '%A, %b %e, %Y',
        headerFormat: this.showTooltipHeader
          ? `<p style="color:${ColorScheme.GRAY_LIGHT_STRONG_VAR}; font-size: 12px">{point.key}</p>`
          : '',

        pointFormatter: function () {
          const that = this as any;
          const additionalData = that.series.userOptions.additionalData;

          // do not show 0 value in tooltip
          if (this.y === 0) {
            return '';
          }

          const isPercent = !!additionalData?.showPercentageSign;
          const showDollar = !!additionalData?.showCurrencySign;

          const value = showDollar ? formatValueIntoCurrency(this.y) : formatLargeNumber(this.y, isPercent, showDollar);
          const index = this.category;
          const name = this.name ?? this.series.name;

          let color = typeof this.series.color === 'string' ? this.series.color : that.series.color?.stops[1][1];

          // if color is not provided, default is gray but we want to use colors form highcharts
          if (additionalData && additionalData.colorTooltipDefault && Highcharts?.defaultOptions?.colors) {
            color = Highcharts.defaultOptions.colors[Number(index)];
          }

          return `
          <div class="space-x-1">
            <span style="color: ${color}">● ${name}:</span>
             <span>${value}</span>
          </div>`;
        },
        valueDecimals: 2,
      },
      plotOptions: {
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
        column: {
          pointPadding: 0.2,
          stacking: 'normal',
          // dataLabels: {
          //   enabled: this.showDataLabel,
          // },
        },
        packedbubble: {
          minSize: '30px',
          maxSize: '120px',
          tooltip: {
            headerFormat: `<p style="color:${ColorScheme.GRAY_LIGHT_STRONG_VAR}; font-size: 12px">{series.name}</p>`,
          },
          layoutAlgorithm: {
            splitSeries: false,
            gravitationalConstant: 0.006,
            seriesInteraction: true,
            dragBetweenSeries: true,
            parentNodeLimit: true,
          },
          dataLabels: {
            enabled: true,
            format: '{point.name}',

            style: {
              color: ColorScheme.GRAY_DARK_VAR,
              fontSize: '16px',
              textOutline: 'none',
              fontWeight: 'normal',
            },
          },
        },
        series: {
          //headerFormat: {},
          // style: {
          // 	fontSize: '12px',
          // 	color: '#D9D8D8',
          // },
          showInNavigator: true,
          borderWidth: 0,
          dataLabels: {
            color: ColorScheme.GRAY_LIGHT_VAR,
            enabled: this.showDataLabel,
            formatter: function () {
              return roundNDigits(this.y, 2);
            },
          },
          enableMouseTracking: this.showTooltip,
          events: {
            legendItemClick: (e: any) => {
              if (!this.enableLegendTogging) {
                e.preventDefault(); // prevent toggling series visibility
              }
            },
          },
        },
        area: {
          marker: {
            radius: 2,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        },
        bar: {
          tooltip: {
            headerFormat: '',
            pointFormat: '<span style="color:{point.color};">{point.name}</span>: <b>{point.y}</b><br/>',
          },
        },
        pie: {
          showInLegend: this.showLegend,
          allowPointSelect: false,
          depth: 35,
          minSize: 70,
          tooltip: {
            headerFormat: undefined,
            // style: {
            // 	fontSize: '13px',
            // 	color: '#D9D8D8',
            // },
            pointFormatter: function () {
              const that = this as any;
              // rounded value
              const rounded = Math.round(that.percentage * 100) / 100;

              const color =
                typeof that.color === 'object' && 'radialGradient' in that.color ? ColorScheme.PRIMARY_VAR : this.color;

              const result = `
              <div class="text-base">
                  <span style="color: ${color}">● ${this.name}: </span>
                  <span>${rounded}%</span>
              </div>
                `;
              return result;
            },
          },
          dataLabels: {
            overflow: 'allow',
            shadow: false,
            style: {
              fontSize: '12px',
              width: 90,
            },
            format: '<span style="color: {point.color}" >{point.name}</span><br>{point.percentage:.2f}%',
            //distance: -25,
            filter: {
              property: 'percentage',
              operator: '>',
              value: 4,
            },
          },
        },
        areaspline: {
          threshold: null,
        },
      },
      series: [...series] as Highcharts.SeriesOptionsType[],
    };
  }

  private fancyColoring() {
    let count = this.applyFancyColor;
    this.series = this.series.map((s) => {
      const data = {
        type: s.type,
        name: s.name,
        data: (s as any)?.data ?? [],
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, (Highcharts.getOptions().colors as any[])[(count % 5) + 2]], // '#25aedd'
            [1, (Highcharts.getOptions().colors as any[])[count % 10]],
          ],
        },
      } as any; // todo fix type
      count += 1;
      return data;
    });
  }

  private initAreaChange() {
    if (this.series.length === 0) {
      console.warn('Cannot init initAreaChange in Generic chart, empty series');
      return;
    }
    const data = ((this.series[0] as any)?.data as number[]) ?? [];
    const oldestData = data[0] as number;
    const newestData = data[data.length - 1] as number;
    const color = oldestData > newestData ? '#ff1010' : '#0d920d';

    this.chartOptions = {
      ...this.chartOptions,
      chart: {
        type: 'areaspline',
      },
      plotOptions: {
        ...this.chartOptions.plotOptions,
        areaspline: {
          ...this.chartOptions.plotOptions!.area,
          lineColor: color,
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, color],
              [1, 'rgb(15 26 69)'],
            ],
          },
        },
      },
    };
  }
}
