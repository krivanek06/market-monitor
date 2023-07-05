import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartConstructor, ColorScheme, GeneralFunctionUtil } from '@market-monitor/shared-utils-client';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import HC_stock from 'highcharts/modules/stock';
import { ChartType, GenericChartSeries, GenericChartSeriesPie } from './generic-chart.model';

HC_stock(Highcharts);
@Component({
  selector: 'app-generic-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="block relative">
      <button
        mat-icon-button
        *ngIf="showExpandableButton"
        class="text-wt-gray-medium hover:text-wt-gray-light z-10 absolute right-0 top-0"
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
export class GenericChartComponent extends ChartConstructor implements OnInit, OnChanges, OnDestroy {
  @Output() expandEmitter: EventEmitter<any> = new EventEmitter<any>();

  @Input({ required: true }) series!: GenericChartSeries[] | GenericChartSeriesPie[];
  @Input() heightPx = 400;
  @Input() chartType: ChartType = ChartType.line;
  @Input() chartTitle = '';
  @Input() chartTitlePosition = 'left';
  @Input() showTimelineSlider = false;
  @Input() showTooltip = true;
  @Input() showDataLabel = false;
  @Input() categories: string[] = [];
  @Input() showYAxis = true;
  @Input() showXAxis = true;
  @Input() shareTooltip = true;

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
  constructor() {
    super();
  }
  ngOnDestroy(): void {
    console.log('GenericChartComponent: ngOnDestroy()');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.applyFancyColor > 0) {
      this.fancyColoring();
    }

    this.initChart();

    if (this.floatingLegend && this.chartOptions.legend) {
      this.chartOptions.legend.floating = true;
      this.chartOptions.legend.layout = 'vertical';
      this.chartOptions.legend.x = -150;
      this.chartOptions.legend.y = 10;
      this.chartOptions.legend.align = 'center';
      this.chartOptions.legend.verticalAlign = 'middle';
    }

    if (this.chartType === ChartType.column && this.chartOptions.xAxis) {
      this.chartOptions.xAxis = {
        ...this.chartOptions.xAxis,
        type: 'category',
        labels: {
          // ...this.chartOptions.xAxis.labels,
          rotation: -20,
        },
      };
    } else if (this.chartType === ChartType.bar && this.chartOptions.xAxis) {
      this.chartOptions.xAxis = {
        ...this.chartOptions.xAxis,
        type: 'category',
      };
    } else if (this.chartType === ChartType.areaChange) {
      this.initAreaChange();
    }

    if (this.categories.length > 0) {
      this.initCategories();
    }
  }

  ngOnInit() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  expand() {
    this.expandEmitter.emit();
  }

  private initCategories() {
    //this.chartOptions.plotOptions!.series!.dataLabels!. = false;
    if (this.chartOptions.xAxis) {
      this.chartOptions.xAxis = {
        ...this.chartOptions.xAxis,
        categories: [...this.categories],
        type: 'category',
        labels: {
          rotation: -20,
        },
      };
    }
  }

  private initChart() {
    this.chartOptions = {
      chart: {
        plotBackgroundColor: undefined,
        plotBorderWidth: undefined,
        plotShadow: false,
        type: this.chartType === ChartType.areaChange ? ChartType.areaspline : this.chartType,
        backgroundColor: 'transparent',
        panning: {
          enabled: true,
        },
      },
      navigator: {
        enabled: this.showTimelineSlider,
        xAxis: {
          labels: {
            formatter: function () {
              return '';
            },
          },
        },
      },
      scrollbar: {
        enabled: this.showTimelineSlider,
      },
      rangeSelector: {
        enabled: false,
      },
      yAxis: {
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
        visible: this.showYAxis,
        labels: {
          style: {
            color: ColorScheme.GRAY_LIGHT_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
      },
      xAxis: {
        visible: this.showXAxis,
        crosshair: true,
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e of %b',
        },
        labels: {
          rotation: 0,
          style: {
            color: ColorScheme.GRAY_LIGHT_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
      },
      title: {
        text: this.chartTitle,
        align: 'left',
        style: {
          color: ColorScheme.GRAY_LIGHT_VAR,
          fontSize: '13px',
          fontWeight: 'normal',
        },
        y: 15,
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
          color: ColorScheme.GRAY_LIGHT_VAR,
          cursor: this.enableLegendTogging ? 'pointer' : 'default',
        },
        itemHoverStyle: {
          color: this.enableLegendTogging ? ColorScheme.GRAY_MEDIUM_VAR : ColorScheme.GRAY_LIGHT_VAR,
        },
        itemHiddenStyle: {
          color: this.enableLegendTogging ? ColorScheme.GRAY_DARK_VAR : ColorScheme.GRAY_LIGHT_VAR,
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
        backgroundColor: '#232323',
        style: {
          fontSize: '14px',
          color: '#D9D8D8',
        },
        shared: this.shareTooltip,
        outside: false,
        useHTML: true,
        xDateFormat: '%Y-%m-%d',
        headerFormat: '<span>{point.key}</span>',

        pointFormatter: function () {
          const that = this as any;
          const value = GeneralFunctionUtil.roundNDigits(that.y, 2);

          // do not show 0 value in tooltip
          if (value === 0) {
            return '';
          }

          // additional data from above
          const additionalData = that.series.userOptions.additionalData;
          const color = typeof that.series.color === 'string' ? that.series.color : that.series.color?.stops[1][1];

          const line1 = `<span style="color: ${color}">● ${that.series.name}:</span>`;
          const line2 = additionalData?.showCurrencySign
            ? `<span>$${value} USD</b></span>`
            : `<span>${value}</b></span>`;
          return `<div class="space-x-1">${line1} ${line2}</div>`;
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
          stacking: this.chartType === ChartType.columnStack ? 'normal' : undefined,
          dataLabels: {
            enabled: this.showDataLabel,
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
            format: undefined,
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
          dataLabels: {
            enabled: true,
          },
          tooltip: {
            headerFormat: '',
            pointFormat: '<span style="color:{point.color};">{point.name}</span>: <b>{point.y}</b><br/>',
          },
        },
        pie: {
          showInLegend: this.showLegend,
          allowPointSelect: false,
          depth: 35,
          minSize: 90,
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

              const result = `
              <div class="text-sm">
                  <span style="color: ${that.color}">● ${that.name}: </span>
                  <span>${rounded}%</span>
              </div>
                `;
              return result;
            },
          },
          dataLabels: {
            style: {
              fontSize: '12px',
              width: 90,
            },
            format: '<span style="color: {point.color}">{point.name}</span><br>{point.percentage:.1f} %',
            //distance: -25,
            filter: {
              property: 'percentage',
              operator: '>',
              value: 4,
            },
          },
          colors: Highcharts.map(Highcharts.getOptions().colors as any[], function (color: any) {
            return {
              radialGradient: {
                cx: 0.5,
                cy: 0.3,
                r: 0.1,
              },
              stops: [
                [0, color],
                [1, Highcharts.color(color).brighten(-0.2).get('rgb')], // darken
              ],
            };
          }),
        },
        areaspline: {
          threshold: null,
        },
      },
      series: [...this.series] as Highcharts.SeriesOptionsType[],
    };
  }

  private fancyColoring() {
    let count = this.applyFancyColor;
    this.series = this.series.map((s) => {
      const data: GenericChartSeries = {
        name: s.name,
        data: s.data,
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, (Highcharts.getOptions().colors as any[])[(count % 5) + 2]], // '#25aedd'
            [1, (Highcharts.getOptions().colors as any[])[count % 10]],
          ],
        },
      } as GenericChartSeries;
      count += 1;
      return data;
    });
  }

  private initAreaChange() {
    if (this.series.length === 0) {
      console.warn('Cannot init initAreaChange in Generic chart, empty series');
      return;
    }
    const data = this.series[0].data as number[];
    const oldestData = data[0] as number;
    const newestData = data[data.length - 1] as number;
    const color = oldestData > newestData ? '#ff1010' : '#0d920d';

    this.chartOptions = {
      ...this.chartOptions,
      chart: {
        type: ChartType.areaspline,
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
