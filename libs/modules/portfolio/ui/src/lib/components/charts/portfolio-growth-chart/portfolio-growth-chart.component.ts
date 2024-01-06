import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioGrowth } from '@market-monitor/modules/portfolio/data-access';
import { ChartConstructor, ColorScheme } from '@market-monitor/shared/data-access';
import { formatValueIntoCurrency } from '@market-monitor/shared/features/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-portfolio-growth-chart',
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
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGrowthChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(input: { values: PortfolioGrowth[]; startingCashValue: number }) {
    this.initChart(input.values, input.startingCashValue);
  }
  @Input() showOnlyTotalBalance = false;

  private initChart(data: PortfolioGrowth[], startingCashValue: number = 0) {
    const isCashActive = startingCashValue > 0;

    const marketTotalValue = data.map((point) => [new Date(point.date).getTime(), point.marketTotalValue]);
    const investedValue = data.map((point) => [new Date(point.date).getTime(), point.investedValue]);

    //  const dates = data.map((point) => dateFormatDate(point.date, 'MMMM d, y'));
    const totalBalanceValues = data.map((point) => [new Date(point.date).getTime(), point.totalBalanceValue]);
    const threshold = data.map((point) => [new Date(point.date).getTime(), startingCashValue ?? 0]);

    // get points when investment value change from previous day
    const investmentChangePoints: [number, number][] = [];
    for (let i = 0; i < data.length; i++) {
      const curr = data[i];
      const prev = data[i - 1];
      if (prev && prev.investedValue !== curr.investedValue) {
        investmentChangePoints.push([new Date(curr.date).getTime(), curr.investedValue]);
      }
    }

    this.chartOptions = {
      chart: {
        type: 'area',
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
        gridLineColor: '#66666644',
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
        headerFormat: '<p style="color:#909592; font-size: 12px">{point.key}</p><br/>',
        pointFormatter: function () {
          const that = this as any;
          const value = formatValueIntoCurrency(that.y);

          const name = that.series.name.toLowerCase();

          return `<p><span style="color: ${that.series.color}; font-weight: bold" class="capitalize">● ${name}: </span><span>${value}</span></p><br/>`;
        },
      },
      plotOptions: {
        area: {
          marker: {
            enabled: true,
            radius: 3,
          },
          lineWidth: 2,
          states: {
            hover: {
              lineWidth: 4,
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
      series: [
        {
          color: ColorScheme.ACCENT_1_VAR,
          type: 'area',
          zIndex: 10,
          yAxis: 0,
          fillColor: {
            linearGradient: {
              x1: 1,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, ColorScheme.ACCENT_1_VAR],
              [1, 'transparent'],
            ],
          },
          name: 'Total Balance',
          data: totalBalanceValues,
        },
        {
          color: ColorScheme.PRIMARY_VAR,
          type: 'area',
          zIndex: 10,
          yAxis: 0,
          opacity: 0.65,
          visible: !isCashActive,
          showInLegend: true,
          fillColor: {
            linearGradient: {
              x1: 1,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, ColorScheme.PRIMARY_VAR],
              [1, 'transparent'],
            ],
          },
          name: 'Market Value',
          data: marketTotalValue,
        },
        // {
        //   color: ColorScheme.PRIMARY_VAR,
        //   type: 'column',
        //   zIndex: 10,
        //   yAxis: 0,
        //   opacity: 0.8,
        //   visible: !isCashActive,
        //   showInLegend: !isCashActive,
        //   name: 'Investment Value Change',
        //   data: investmentChangePoints,
        // },
        {
          color: ColorScheme.ACCENT_2_VAR,
          type: 'area',
          zIndex: 10,
          yAxis: 0,
          opacity: 0.2,
          visible: !isCashActive,
          showInLegend: true,
          fillColor: {
            linearGradient: {
              x1: 1,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, ColorScheme.ACCENT_2_VAR],
              [1, 'transparent'],
            ],
          },
          name: 'Investment Value',
          data: investedValue,
        },
        {
          color: ColorScheme.DANGER_VAR,
          type: 'area',
          zIndex: 10,
          yAxis: 0,
          opacity: 0.45,
          visible: isCashActive,
          showInLegend: true,
          fillColor: {
            linearGradient: {
              x1: 1,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, ColorScheme.DANGER_VAR],
              [1, 'transparent'],
            ],
          },
          name: 'Threshold',
          data: threshold,
        },
      ],
    };
  }
}
