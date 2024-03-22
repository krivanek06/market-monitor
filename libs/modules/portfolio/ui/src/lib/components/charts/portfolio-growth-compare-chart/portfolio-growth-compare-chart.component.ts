import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { UserBase } from '@mm/api-types';
import { PortfolioGrowth } from '@mm/portfolio/data-access';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import { SeriesOptionsType } from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';

export type PortfolioGrowthCompareChartData = {
  portfolioGrowth: PortfolioGrowth[];
  userBase: UserBase;
};

@Component({
  selector: 'app-portfolio-growth-compare-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  template: `
    <highcharts-chart
      *ngIf="isHighcharts"
      [(update)]="updateFromInput"
      [Highcharts]="Highcharts"
      [callbackFunction]="chartCallback"
      [options]="chartOption()"
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
export class PortfolioGrowthCompareChartComponent extends ChartConstructor {
  data = input.required<PortfolioGrowthCompareChartData[]>();

  renderChartEffect = effect(() => {
    console.log('ttttt', this.data());
    console.log(' this.initChart(this.data())', this.initChart(this.data()));
  });

  chartOption = computed(() => this.initChart(this.data()));

  private initChart(data: PortfolioGrowthCompareChartData[]): Highcharts.Options {
    return {
      chart: {
        type: 'line',
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
      xAxis: {
        labels: {
          rotation: -20,
          enabled: true,
          format: '{value:%b %e. %Y}',
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
        type: 'datetime',
      },
      title: {
        text: '',
        align: 'left',
        y: 0,
        floating: true,
        style: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          fontSize: '13px',
        },
      },
      subtitle: undefined,
      scrollbar: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
        //floating: true,
        verticalAlign: 'top',
        align: 'left',
        //layout: 'vertical',
        y: -8,
        //x: 50,
        itemStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          cursor: 'default',
          fontSize: '12px',
        },
        itemHoverStyle: {
          color: ColorScheme.GRAY_LIGHT_VAR,
        },
        itemHiddenStyle: {
          color: ColorScheme.GRAY_DARK_VAR,
        },
        labelFormatter: function () {
          const that = this as any;
          return `<span style="color: ${that.color};">${that.name}</span>`;
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
        headerFormat: `<p style="color:${ColorScheme.GRAY_LIGHT_STRONG_VAR}; font-size: 12px">{point.key}</p><br/>`,
        pointFormatter: function () {
          const that = this as any;
          const value = formatValueIntoCurrency(that.y);

          const name = that.series.name.toLowerCase();

          return `<p><span style="color: ${that.series.color}; font-weight: bold" class="capitalize">● ${name}: </span><span>${value}</span></p><br/>`;
        },
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
        series: {
          borderWidth: 2,
          enableMouseTracking: true,
          // events: {
          // 	legendItemClick: function () {
          // 		return false;
          // 	},
          // },
        },
      },
      series: data.map(
        (d) =>
          ({
            color: ColorScheme.ACCENT_1_VAR,
            type: 'line',
            name: `${d.userBase.personal.displayName}`,
            data: d.portfolioGrowth.map((point) => [Date.parse(point.date), point.totalBalanceValue]),
          }) satisfies SeriesOptionsType,
      ),
    };
  }
}
