import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartConstructor, ColorScheme, GenericChartSeries } from '@mm/shared/data-access';
import { formatLargeNumber, formatValueIntoCurrency, roundNDigits } from '@mm/shared/general-util';
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
        *ngIf="showExpandableButton()"
        class="text-wt-gray-medium hover:text-wt-gray-medium z-10 absolute right-0 top-0"
        (click)="expand()"
        matTooltip="Expand chart"
      >
        <mat-icon>open_with</mat-icon>
      </button>

      <highcharts-chart
        *ngIf="isHighcharts()"
        [Highcharts]="Highcharts"
        [options]="chartOptionsSignal()"
        [style.height.px]="heightPx()"
        style="width: 100%; display: block"
      />
    </div>
  `,
})
export class GenericChartComponent<T extends Highcharts.SeriesOptionsType['type']> extends ChartConstructor {
  expandEmitter = output<void>();

  series = input.required<GenericChartSeries<T>[]>();

  chartType = input<Highcharts.SeriesOptionsType['type']>('line');
  chartTitle = input('');
  chartTitlePosition = input<Highcharts.AlignValue>('left');
  enableZoom = input(false);
  showTooltip = input(true);
  showDataLabel = input(false);
  categories = input<string[]>([]);
  showYAxis = input(true);
  showXAxis = input(true);
  shareTooltip = input(true);
  showTooltipHeader = input(true);

  // legend
  showLegend = input(false);
  enableLegendTogging = input(false);
  showLegendLatestValue = input(false);
  legendAlign = input<'left' | 'center' | 'right'>('left');
  legentLayout = input<'vertical' | 'horizontal'>('horizontal');
  legendVerticalAlign = input<'top' | 'middle' | 'bottom'>('top');
  floatingLegend = input(false);

  showExpandableButton = input(false);
  applyFancyColor = input(0);
  isCategoryDates = input(false);

  chartOptionsSignal = computed(() => {
    const series = this.applyFancyColor() > 0 ? this.fancyColoring(this.series()) : this.series();

    const chartOptions = this.initChart(series);

    if (this.floatingLegend() && chartOptions.legend) {
      chartOptions.legend.floating = true;
      chartOptions.legend.layout = 'vertical';
      chartOptions.legend.x = -150;
      chartOptions.legend.y = 10;
      chartOptions.legend.align = 'center';
      chartOptions.legend.verticalAlign = 'middle';
    }

    if (this.chartType() === 'column' && chartOptions.xAxis) {
      chartOptions.xAxis = {
        ...chartOptions.xAxis,
        type: 'category',
      };
    } else if (this.chartType() === 'column' && chartOptions.xAxis) {
      chartOptions.xAxis = {
        ...chartOptions.xAxis,
        type: 'category',
      };
    }

    if (this.categories().length > 0 && chartOptions.xAxis) {
      //this.initCategories();
      chartOptions.xAxis = {
        ...chartOptions.xAxis,
        categories: this.isCategoryDates()
          ? this.categories().map((d) => format(new Date(d), 'MMM dd, yyyy'))
          : this.categories(),
        type: 'category',
      };
    }
    return chartOptions;
  });

  expand() {
    this.expandEmitter.emit();
  }

  private initChart(series: ChartInputType): Highcharts.Options {
    return {
      chart: {
        type: this.chartType(),
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
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: false,
          gridLineWidth: 1,
          tickPixelInterval: 30,
          //minorGridLineWidth: 0, // gray-ish grid lines
          visible: this.showYAxis(),
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
          //minorGridLineWidth: 0, // gray-ish grid lines
          visible: this.showYAxis(),
          labels: {
            style: {
              color: ColorScheme.GRAY_MEDIUM_VAR,
              font: '10px Trebuchet MS, Verdana, sans-serif',
            },
          },
        },
      ],
      xAxis: {
        visible: this.showXAxis(),
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
        text: this.chartTitle(),
        align: this.chartTitlePosition(),
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
        enabled: this.showLegend(),
        itemStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          cursor: this.enableLegendTogging() ? 'pointer' : 'default',
        },
        itemHoverStyle: {
          color: this.enableLegendTogging() ? ColorScheme.GRAY_MEDIUM_VAR : ColorScheme.GRAY_MEDIUM_VAR,
        },
        itemHiddenStyle: {
          color: this.enableLegendTogging() ? ColorScheme.GRAY_DARK_VAR : ColorScheme.GRAY_MEDIUM_VAR,
        },
        verticalAlign: this.legendVerticalAlign(),
        align: this.legendAlign(),
        layout: this.legentLayout(),
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      tooltip: {
        borderWidth: 1,
        padding: 12,
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        style: {
          fontSize: '15px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        shared: this.shareTooltip(),
        outside: false,
        useHTML: true,
        xDateFormat: '%A, %b %e, %Y',
        headerFormat: this.showTooltipHeader()
          ? `<p style="color:${ColorScheme.GRAY_DARK_VAR}; font-size: 12px">{point.key}</p>`
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
            enabled: this.showDataLabel(),
            formatter: function () {
              return roundNDigits(this.y, 2);
            },
          },
          enableMouseTracking: this.showTooltip(),
          events: {
            legendItemClick: (e: any) => {
              if (!this.enableLegendTogging()!) {
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
          showInLegend: this.showLegend(),
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
      },
      series: [...series] as Highcharts.SeriesOptionsType[],
    };
  }

  private fancyColoring<K extends GenericChartSeries<T>>(series: K[]): K[] {
    let count = this.applyFancyColor();
    const newSeries = series.map((s) => {
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

    return newSeries;
  }
}
