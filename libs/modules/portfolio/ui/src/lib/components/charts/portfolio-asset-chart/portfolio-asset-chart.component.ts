import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PortfolioGrowthAssets } from '@market-monitor/api-types';
import {
  ChartConstructor,
  ColorScheme,
  GenericChartSeries,
  InputSource,
  getChartGenericColor,
} from '@market-monitor/shared/data-access';
import { dateFormatDate, formatValueIntoCurrency } from '@market-monitor/shared/features/general-util';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  DefaultImgDirective,
  filterDataByTimestamp,
} from '@market-monitor/shared/ui';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { computedFrom } from 'ngxtension/computed-from';
import { BehaviorSubject, combineLatest, map, pipe, startWith } from 'rxjs';

@Component({
  selector: 'app-portfolio-asset-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    ReactiveFormsModule,
    DefaultImgDirective,
    MatButtonModule,
    HighchartsChartModule,
    DateRangeSliderComponent,
  ],
  template: `
    <section class="relative">
      <!-- list of symbols -->
      <mat-chip-listbox aria-label="Asset Selection" [multiple]="true" [formControl]="symbolsControl" class="mt-2">
        <mat-chip-option *ngFor="let inputSource of symbolInputSourceSignal()" class="h-10 mb-3 mr-1 g-mat-chip">
          <div class="flex flex-wrap items-center gap-4 px-2">
            <img appDefaultImg imageType="symbol" [src]="inputSource.value" [alt]="inputSource.caption" class="h-7" />
            <span class="text-base">{{ inputSource.caption }}</span>
          </div>
        </mat-chip-option>
      </mat-chip-listbox>

      <!-- time slider -->
      <div class="flex justify-end">
        <app-date-range-slider
          *ngIf="dateRangeControl.value"
          class="hidden md:block w-[550px]"
          [formControl]="dateRangeControl"
        />
      </div>

      <!-- chart -->
      <highcharts-chart
        *ngIf="isHighcharts"
        [Highcharts]="Highcharts"
        [options]="chartOptionsSignal()"
        [callbackFunction]="chartCallback"
        [(update)]="updateFromInput"
        [oneToOne]="true"
        style="width: 100%; display: block"
        [style.height.px]="heightPx()"
      >
      </highcharts-chart>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioAssetChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(input: PortfolioGrowthAssets[]) {
    const inputSource = input.map(
      (asset) => ({ caption: asset.symbol, value: asset.symbol }) satisfies InputSource<string>,
    );
    this.symbolInputSourceSignal.set(inputSource);
    this.symbolsControl.setValue([]);
    this.portfolioGrowth$.next(input);
  }

  /**
   * selected symbols by the user
   */
  symbolsControl = new FormControl<string[]>([], {
    nonNullable: true,
  });

  /**
   * data range control for chart zoom
   */
  dateRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  /**
   * save provided data into the component
   */
  private portfolioGrowth$ = new BehaviorSubject<PortfolioGrowthAssets[]>([]);

  private chartDataSignal = toSignal(
    combineLatest([
      this.portfolioGrowth$.asObservable(),
      this.symbolsControl.valueChanges.pipe(startWith(this.symbolsControl.value)),
    ]).pipe(map(([portfolioAssets, selectedSymbols]) => this.formatData(portfolioAssets, selectedSymbols))),
    { initialValue: [] },
  );

  /**
   * displayed symbols on the ui
   */
  symbolInputSourceSignal = signal<InputSource<string>[]>([]);

  /**
   * options config to the chart
   */
  chartOptionsSignal = computedFrom(
    [this.chartDataSignal, this.dateRangeControl.valueChanges.pipe(startWith(null))],
    pipe(
      map(([chartData, dateRange]) => {
        // reduce data into the chart based on date range
        const newData = chartData.map((d) => ({
          ...d,
          data: filterDataByTimestamp(d.data as [number, number][], dateRange),
        }));

        return this.initChart(newData);
      }),
    ),
  );

  constructor() {
    super();

    // based on 'balance' length, patch value into dateRangeControl
    toObservable(this.chartDataSignal)
      .pipe(takeUntilDestroyed())
      .subscribe((res) => {
        const balance = res[0].data ?? [];

        // nothing is selected yet
        if (!balance || balance.length === 0) {
          this.dateRangeControl.patchValue(null);
          return;
        }

        // balance range changed
        this.dateRangeControl.patchValue({
          currentMaxDateIndex: balance.length - 1,
          currentMinDateIndex: 0,
          dates: balance.map((d) => dateFormatDate(new Date((d as [number, number])[0]))),
        });
      });
  }

  private initChart(series: Highcharts.SeriesOptionsType[]): Highcharts.Options {
    return {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
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
          visible: true,
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
          minorTickInterval: 'auto', // TODO: this one may cause problem, check if needed
          tickPixelInterval: 30,
          //minorGridLineWidth: 0, // gray-ish grid lines
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
        visible: true,
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
        text: '',
      },
      subtitle: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
        itemStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
          cursor: 'pointer',
        },
        itemHoverStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
        },
        itemHiddenStyle: {
          color: ColorScheme.GRAY_MEDIUM_VAR,
        },
        verticalAlign: 'top',
        align: 'left',
        layout: 'horizontal',
      },
      tooltip: {
        borderWidth: 1,
        padding: 12,
        backgroundColor: ColorScheme.GRAY_DARK_STRONG_VAR,
        style: {
          fontSize: '15px',
          color: ColorScheme.GRAY_LIGHT_STRONG_VAR,
        },
        shared: true,
        outside: false,
        useHTML: true,
        xDateFormat: '%A, %b %e, %Y',
        headerFormat: `<p style="color:${ColorScheme.GRAY_LIGHT_STRONG_VAR}; font-size: 12px">{point.key}</p>`,

        pointFormatter: function () {
          const additionalData = (this as any).series.userOptions?.additionalData ?? {};
          const unitsOnDate = (additionalData.units ?? [])[this.index];
          // do not show 0 value in tooltip
          if (this.y === 0) {
            return '';
          }

          // format value into currency
          const value = formatValueIntoCurrency(this.y);

          return `
          <div class="flex items-center gap-2">
            <div style="color: ${this.series.color}" class="min-w-[80px]">● ${this.series.name}:</div>
            <div class="text-wt-gray-light min-w-[85px]">${value}</div>
            <div class="text-wt-gray-light-strong">${unitsOnDate ? `[${unitsOnDate}]` : ''}</div>
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
        },
        series: {
          showInNavigator: true,
          borderWidth: 0,
          dataLabels: {
            enabled: false,
          },
          enableMouseTracking: true,
          events: {
            legendItemClick: (e: any) => {
              e.preventDefault(); // prevent toggling series visibility
            },
          },
        },
      },
      series: series,
    };
  }

  /**
   *
   * @param portfolioAssets - historical invested value into assets
   * @param selectedSymbols - selected symbols by the user
   * @returns formatted PortfolioGrowthAssets with the selected symbols into the Highcharts.SeriesOptionsType
   */
  private formatData(
    portfolioAssets: PortfolioGrowthAssets[],
    selectedSymbols: string[],
  ): GenericChartSeries<'line' | 'column'>[] {
    const portfolioFiltered = portfolioAssets.filter((asset) => selectedSymbols.includes(asset.symbol));
    const seriesData = portfolioFiltered.map(
      (d, index) =>
        ({
          type: 'line',
          name: d.symbol,
          data: d.data.map((g) => [Date.parse(g.date), g.marketTotalValue]),
          yAxis: 1,
          color: getChartGenericColor(index),
          additionalData: {
            units: d.data.map((val) => val.units),
          },
        }) satisfies GenericChartSeries<'line'>,
    );

    const totalSeriesData = seriesData.reduce(
      (acc, curr) => {
        // [number, number] => [timestamp, value]
        const currData = curr.data as [number, number][]; // cast to correct type
        const accData = acc.data as [number, number][]; // cast to correct type

        // check if data in acc
        for (const data of currData) {
          // create copy to prevent mutation
          const dataCopy = [...data] satisfies [number, number];
          const timestamp = dataCopy[0]; // timestamp
          const value = dataCopy[1]; // value

          // get index of existing timestamp in acc
          const accDataIndex = accData.findIndex((d) => d[0] === timestamp);

          // if timestamp exists in acc, add value to existing value
          if (accDataIndex > -1) {
            accData[accDataIndex][1] += value;
          }
          // empty array or add value at the end of the array if timestamp higher than last element
          else if (accData.length === 0 || timestamp > accData[accData.length - 1][0]) {
            accData.push(dataCopy);
          } else {
            // find the index of timestamp in the middle of the array, however timestamp does not yet exists
            const index = accData.findIndex((d, i) => timestamp > d[0] && timestamp < accData[i + 1][0]);
            // add value at the beginning of the array if timestamp lower than first element
            const usedIndex = index > -1 ? index : 0;
            // inset data into accData in index position
            accData.splice(usedIndex, 0, dataCopy);
          }
        }
        return { ...acc, data: accData };
      },
      {
        type: 'column',
        name: 'Balance',
        data: [] as [number, number][],
        yAxis: 0,
        opacity: 0.55,
        color: ColorScheme.ACCENT_1_VAR,
      } as Highcharts.SeriesColumnOptions,
    );

    return [totalSeriesData, ...seriesData];
  }
}
