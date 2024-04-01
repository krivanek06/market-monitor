import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartConstructor, ColorScheme, GenericChartSeries } from '@mm/shared/data-access';
import { roundNDigits } from '@mm/shared/general-util';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import highcharts3d from 'highcharts/highcharts-3d';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  template: `
    <highcharts-chart
      *ngIf="isHighcharts()"
      [Highcharts]="Highcharts"
      [options]="chartOptionsComputed()"
      [callbackFunction]="chartCallback"
      [style.height.px]="heightPx()"
    />
  `,
  styles: `
    :host {
      display: block;

      highcharts-chart {
        width: 100% !important;
        display: block !important;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartComponent extends ChartConstructor {
  chartTitle = input('');
  series = input.required<GenericChartSeries<'pie'>>();

  chartOptionsComputed = computed(() => this.innitChart(this.series()));

  constructor() {
    super();
    highcharts3d(Highcharts);
  }

  private innitChart(series: GenericChartSeries<'pie'>): Highcharts.Options {
    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        options3d: {
          enabled: true,
          alpha: 45,
        },
      },
      title: {
        text: this.chartTitle(),
        align: 'center',
        style: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          fontSize: '15px',
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
        enabled: false,
      },
      tooltip: {
        borderWidth: 1,
        padding: 12,
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        style: {
          fontSize: '16px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        shared: true,
      },
      plotOptions: {
        pie: {
          innerSize: 100,
          depth: 45,
          tooltip: {
            headerFormat: undefined,
            // style: {
            // 	fontSize: '13px',
            // 	color: '#D9D8D8',
            // },
            pointFormatter: function () {
              const that = this as any;
              // rounded value
              const rounded = roundNDigits(that.percentage);
              const color = Highcharts.getOptions()?.colors?.[this.colorIndex ?? 0] ?? ColorScheme.PRIMARY_VAR;

              // const color =
              //   typeof that.color === 'object' && 'radialGradient' in that.color ? ColorScheme.PRIMARY_VAR : this.color;

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
              fontSize: '14px',
              width: 90,
              textOutline: 'transparent',
            },
            formatter: function () {
              const that = this as any;
              const rounded = roundNDigits(that.percentage);
              const color = Highcharts.getOptions()?.colors?.[this.colorIndex ?? 0] ?? ColorScheme.PRIMARY_VAR;

              const result = `
                  <div style="color: ${color}">${that.key}</div>
                `;
              return result;
            },
            //distance: -25,
            filter: {
              property: 'percentage',
              operator: '>',
              value: 4,
            },
          },
          colors: (Highcharts.getOptions().colors ?? ([] as any[])).map((color) => {
            return {
              radialGradient: {
                cx: 0.5,
                cy: 0.25,
                r: 0.25,
              },
              stops: [
                [0, color],
                [1, Highcharts.color(color).brighten(-0.2).get('rgb')], // darken
              ],
            };
          }),
        },
      },
      series: [series],
    };
  }
}
