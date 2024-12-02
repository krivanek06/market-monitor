import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TradingSimulator, TradingSimulatorSymbol, UserBaseMin } from '@mm/api-types';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-trading-simulator-symbol-price-chart',
  standalone: true,
  imports: [HighchartsChartModule, DefaultImgDirective, CurrencyPipe, PercentageIncreaseDirective],
  template: `
    <div class="mb-2 flex items-center justify-between">
      <!-- name + image -->
      <div class="flex items-center gap-3">
        <img [src]="simulatorSymbol().symbol" appDefaultImg imageType="symbol" class="h-5 w-5" />
        <div class="text-wt-primary text-sm">{{ simulatorSymbol().symbol }}</div>
      </div>
      <!-- current price -->
      <div class="flex items-center gap-2 text-sm">
        <div class="text-wt-gray-dark">
          {{ currentPrice() | currency }}
        </div>

        @if (previousPrice() !== 0 && this.simulator().currentRound >= 2) {
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [currentValues]="{
              value: currentPrice(),
              valueToCompare: previousPrice(),
            }"
          ></div>
        }
      </div>
    </div>

    <!-- chart -->
    <highcharts-chart
      [Highcharts]="Highcharts"
      [options]="chartOptionsSignal()"
      [style.height.px]="heightPx()"
      style="width: 100%; display: block"
    />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorSymbolPriceChartComponent extends ChartConstructor {
  readonly simulator = input.required<TradingSimulator>();
  readonly simulatorSymbol = input.required<TradingSimulatorSymbol>();
  readonly authUser = input.required<UserBaseMin>();
  readonly currentPrice = computed(() => {
    const currentRound = this.simulator().currentRound;
    const usedCurrentRound = currentRound === 0 ? 0 : currentRound - 1;
    return this.simulatorSymbol().historicalDataModified.at(usedCurrentRound) ?? 0;
  });
  readonly previousPrice = computed(() => {
    const currentRound = this.simulator().currentRound;

    // prevent overflow
    if (currentRound < 2 || this.simulator().state !== 'started') {
      return 0;
    }
    return this.simulatorSymbol().historicalDataModified.at(currentRound - 2) ?? 0;
  });

  readonly chartOptionsSignal = computed(() => {
    const simulator = this.simulator();
    const symbol = this.simulatorSymbol();
    const authUser = this.authUser();

    const currentRound = simulator.currentRound;
    const isOwner = authUser.id === simulator.owner.id;
    const categories = Array.from({ length: simulator.maximumRounds }).map((_, i) => String(i + 1));

    // create an array of issued units on specific round
    const issuedUnitsOnRound = Array.from({ length: symbol.historicalDataModified.length }).map((_, i) => {
      const units = symbol.unitsAdditionalIssued.find((d) => d.issuedOnRound === i + 1)?.units ?? 0;
      return units;
    });

    // units everybody sees up to the current round
    const issuedUnitsPubliclyVisible = issuedUnitsOnRound.slice(0, currentRound);

    // units only the owner sees from the current round
    const issuedUnitsOwnerVisible = isOwner ? issuedUnitsOnRound.slice(currentRound) : [];

    // prices everybody sees up to the current round
    const pricesPubliclyVisible = symbol.historicalDataModified.slice(0, currentRound);

    // prices only the owner sees from the current round
    const pricesOwnerVisible = isOwner ? symbol.historicalDataModified.slice(currentRound) : [];

    // combine data
    const pricesDisplay = [...pricesPubliclyVisible, ...pricesOwnerVisible];
    const issuedUnitsDisplay = [...issuedUnitsPubliclyVisible, ...issuedUnitsOwnerVisible];

    console.log({ symbol, pricesDisplay, issuedUnitsDisplay });

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
          fontSize: '14px',
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
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: true,
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
          enabled: true,
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
        plotLines: [
          {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            value: currentRound,
          },
        ],
        type: 'category',
        categories: categories,
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
        enabled: false,
      },
      tooltip: {
        padding: 11,
        enabled: true,
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        xDateFormat: '%A, %b %e, %Y',
        style: {
          fontSize: '14px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        shared: true,
        headerFormat: `<div style="font-size: 12px">Round: <span style="color: ${ColorScheme.PRIMARY_VAR}">{point.key}</span></div><br/>`,
        pointFormatter: function () {
          const name = this.series.name;
          const value = name.toLocaleLowerCase() === 'price' ? formatValueIntoCurrency(this.y) : this.y;

          return `<p><span style="color: ${this.color};">● ${name}: </span><span>${value}</span></p><br/>`;
        },
      },
      series: [
        {
          type: 'line',
          data: pricesDisplay,
          zoneAxis: 'x',
          yAxis: 0,
          name: 'Price',
          zones: [
            {
              value: currentRound,
              color: ColorScheme.ACCENT_1_VAR,
            },
            {
              color: ColorScheme.ACCENT_2_VAR,
            },
          ],
        },
        {
          type: 'column',
          data: issuedUnitsDisplay,
          zoneAxis: 'x',
          yAxis: 1,
          opacity: 0.65,
          borderColor: ColorScheme.GRAY_DARK_VAR,
          name: 'Units',
          zones: [
            {
              value: currentRound,
              color: ColorScheme.ACCENT_1_VAR,
            },
            {
              color: ColorScheme.ACCENT_2_VAR,
            },
          ],
        },
      ],
    } satisfies Highcharts.Options;
  });
}
