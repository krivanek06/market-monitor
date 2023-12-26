import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartConstructor, ColorScheme, GenericChartSeries } from '@market-monitor/shared/data-access';
import { formatValueIntoCurrency } from '@market-monitor/shared/features/general-util';
import { SeriesOptionsType } from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-generic-chart-bubble',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
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
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericChartBubbleComponent extends ChartConstructor {
  @Input({ required: true }) set data(input: GenericChartSeries<{ name: string; value: number }>[]) {
    this.initChart(input);
  }

  private initChart(data: GenericChartSeries<{ name: string; value: number }>[]) {
    this.chartOptions = {
      chart: {
        type: 'packedbubble',
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
        align: 'center',
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
        headerFormat: '<p style="color:#909592; font-size: 12px">{point.key}</p><br/>',
        pointFormatter: function () {
          const that = this as any;
          const value = formatValueIntoCurrency(that.y);

          const name = that.series.name.toLowerCase();

          return `<p><span style="color: ${that.series.color}; font-weight: bold" class="capitalize">● ${name}: </span><span>${value}</span></p><br/>`;
        },
      },
      plotOptions: {
        packedbubble: {
          minSize: '30px',
          maxSize: '120px',
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
              color: 'black',
              textOutline: 'none',
              fontWeight: 'normal',
            },
          },
        },
      },
      series: data as SeriesOptionsType[],
    };
  }
}
