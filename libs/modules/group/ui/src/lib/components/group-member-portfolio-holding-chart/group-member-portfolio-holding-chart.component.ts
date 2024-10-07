import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PortfolioStateHolding } from '@mm/api-types';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-group-member-portfolio-holding-chart',
  standalone: true,
  imports: [HighchartsChartModule],
  template: `
    @if (isHighcharts()) {
      <highcharts-chart
        [Highcharts]="Highcharts"
        [options]="chartOptionsSignal()"
        [callbackFunction]="chartCallback"
        [style.height.px]="heightPx()"
        [oneToOne]="true"
        style="display: block; width: 100%"
      />
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupMemberPortfolioHoldingChartComponent extends ChartConstructor {
  readonly data = input.required<PortfolioStateHolding[]>();

  readonly chartOptionsSignal = computed(() => this.initChart(this.data()));

  private initChart(data: PortfolioStateHolding[]): Highcharts.Options {
    const symbols = data.map((holding) => holding.symbolQuote.displaySymbol ?? holding.symbol);
    const balance = data.map((holding) => holding.units * holding.symbolQuote.price);
    const invested = data.map((holding) => holding.invested);
    const profitPerSymbol = data.map((holding) => holding.units * holding.symbolQuote.price - holding.invested);
    const userOwners = data.map((holding) => holding.userIds?.length ?? 0);

    return {
      chart: {
        type: 'column',
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
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: false,
          gridLineWidth: 1,
          tickPixelInterval: 30,
          minorGridLineWidth: 0,
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
          opposite: true,
          visible: false,
        },
        {
          title: {
            text: '',
          },
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: true,
          visible: true,
          gridLineWidth: 1,
          tickPixelInterval: 30,
          minorGridLineWidth: 0,
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
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
        type: 'category',
        categories: symbols,
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
        enabled: false,
      },
      tooltip: {
        padding: 11,
        enabled: true,
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        xDateFormat: '%A, %b %e, %Y',
        style: {
          fontSize: '16px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        shared: true,
        headerFormat: `<div style="font-size: 14px">Symbol: <span style="color: ${ColorScheme.PRIMARY_VAR}">{point.key}</span></div><br/>`,
        pointFormatter: function () {
          const name = this.series.name.toLowerCase();
          const value = name === 'holders' ? this.y : formatValueIntoCurrency(this.y);
          const color =
            name === 'profit' ? ((this.y ?? 0) >= 0 ? ColorScheme.SUCCESS_VAR : ColorScheme.DANGER_VAR) : this.color;

          return `<p><span style="color: ${color}; font-weight: bold" class="capitalize">● ${name}: </span><span>${value}</span></p><br/>`;
        },
      },
      plotOptions: {
        column: {
          grouping: false,
          shadow: false,
          borderWidth: 0,
        },
        series: {
          borderWidth: 2,
          enableMouseTracking: true,
        },
      },
      series: [
        {
          name: 'Profit',
          data: profitPerSymbol,
          zoneAxis: 'y',
          type: 'area',
          threshold: 0,
          color: ColorScheme.SUCCESS_VAR,
          negativeColor: ColorScheme.DANGER_VAR,
          opacity: 0.2,
          yAxis: 2,
        },
        {
          name: 'Balance',
          data: balance,
          type: 'column',
          pointPadding: 0.4,
          //pointPlacement: -0.2,
        },
        {
          name: 'Invested',
          data: invested,
          type: 'column',
          pointPadding: 0.2,
          //pointPlacement: -0.2,
          color: ColorScheme.GRAY_MEDIUM_VAR,
          opacity: 0.7,
        },
        {
          name: 'Holders',
          data: userOwners,
          type: 'line',
          opacity: 0.5,
          color: ColorScheme.ACCENT_1_VAR,
          yAxis: 1,
        },
      ],
    };
  }
}
