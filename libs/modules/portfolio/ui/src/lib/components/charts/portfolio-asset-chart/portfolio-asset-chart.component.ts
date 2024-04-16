import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PortfolioGrowthAssets } from '@mm/api-types';
import {
  ChartConstructor,
  ColorScheme,
  GenericChartSeries,
  InputSource,
  getChartGenericColor,
} from '@mm/shared/data-access';
import {
  fillOutMissingDatesForDate,
  formatValueIntoCurrency,
  getCurrentDateDefaultFormat,
} from '@mm/shared/general-util';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  DefaultImgDirective,
  filterDataByTimestamp,
} from '@mm/shared/ui';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { computedFrom } from 'ngxtension/computed-from';
import { map, pipe, startWith } from 'rxjs';

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
      <mat-chip-listbox
        aria-label="Asset Selection"
        [multiple]="true"
        [formControl]="symbolsControl"
        class="mt-3 max-h-[200px] overflow-y-scroll p-3"
      >
        <mat-chip-option
          *ngFor="let inputSource of symbolInputSourceSignal()"
          class="h-10 mb-3 mr-1 g-mat-chip"
          color="primary"
        >
          <div class="flex flex-wrap items-center gap-4 px-2">
            <img appDefaultImg imageType="symbol" [src]="inputSource.value" [alt]="inputSource.caption" class="h-7" />
            <span class="text-base">{{ inputSource.caption }}</span>
          </div>
        </mat-chip-option>
      </mat-chip-listbox>

      <!-- time slider -->
      <div class="flex justify-end" [ngClass]="{ hidden: symbolsControl.value.length === 0 }">
        <app-date-range-slider class="hidden md:block w-[550px]" [formControl]="dateRangeControl" />
      </div>

      <!-- chart -->
      @if (symbolsControl.value.length > 0) {
        @if (displayChart()) {
          <highcharts-chart
            *ngIf="isHighcharts()"
            [Highcharts]="Highcharts"
            [options]="chartOptionsSignal()"
            [callbackFunction]="chartCallback"
            [style.height.px]="heightPx()"
            style="width: 100%; display: block"
          />
        } @else {
          <div class="g-skeleton" [style.height.px]="heightPx()"></div>
        }
      } @else {
        <div class="grid place-content-center text-base" [style.height.px]="heightPx() + 100">No data available</div>
      }
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
  data = input<PortfolioGrowthAssets[] | undefined>();

  /**
   * selected symbols by the user
   */
  symbolsControl = new FormControl<string[]>([], { nonNullable: true });

  /**
   * data range control for chart zoom
   */
  dateRangeControl = new FormControl<DateRangeSliderValues>(
    {
      currentMaxDateIndex: 0,
      currentMinDateIndex: 0,
      dates: [],
    },
    { nonNullable: true },
  );

  /**
   * used to destroy and recreate the chart
   */
  displayChart = signal(false);

  /**
   * displayed symbols on the ui
   */
  symbolInputSourceSignal = computed(() =>
    (this.data() ?? []).map((asset) => ({ caption: asset.symbol, value: asset.symbol }) satisfies InputSource<string>),
  );

  symbolsControlSignal = toSignal(this.symbolsControl.valueChanges, {
    initialValue: this.symbolsControl.value,
  });

  /**
   * effect to patch value to the slider based on the selected symbols
   */
  dateRangeEffect = effect(
    () => {
      const allAssetsData = this.data() ?? [];
      const selectedSymbols = this.symbolsControlSignal();

      // nothing is selected or empty data
      if (selectedSymbols.length === 0 || allAssetsData.length === 0) {
        this.dateRangeControl.patchValue({
          currentMaxDateIndex: 0,
          currentMinDateIndex: 0,
          dates: [],
        });
        return;
      }

      // create range of dates from the minimal date to the current date up to today
      const minDate = allAssetsData
        .filter((d) => selectedSymbols.includes(d.symbol))
        .reduce((acc, curr) => (curr.data[0].date < acc ? curr.data[0].date : acc), getCurrentDateDefaultFormat());

      // generate missing dates between minDate and today
      const missingDates = fillOutMissingDatesForDate(minDate, new Date());

      // set value to the form
      this.dateRangeControl.patchValue({
        currentMaxDateIndex: missingDates.length - 1,
        currentMinDateIndex: 0,
        dates: missingDates,
      });
    },
    { allowSignalWrites: true },
  );

  /**
   * save provided data into the component
   */
  chartOptionsSignal = computedFrom(
    [
      this.dateRangeControl.valueChanges.pipe(startWith(this.dateRangeControl.value)),
      this.symbolsControl.valueChanges.pipe(startWith(this.symbolsControl.value)),
    ],
    pipe(
      map(([dateRange, selectedSymbols]) => {
        const series = this.formatData(this.data() ?? [], selectedSymbols);
        const newData = series.map((d) => ({
          ...d,
          data: filterDataByTimestamp(d.data as [number, number][], dateRange),
        })) satisfies Highcharts.SeriesOptionsType[];

        return this.initChart(newData);
      }),
    ),
  );

  /**
   * effect used to destroy the chart and recreate it with updated series,
   * otherwise new data inside the series is not showed
   * TODO: remove this - it is a hack
   */
  chartOptionsSignalEffect = effect(
    () => {
      this.symbolsControlSignal();

      this.displayChart.set(false);

      setTimeout(() => {
        this.displayChart.set(true);
      }, 300);
    },
    { allowSignalWrites: true },
  );

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
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: false,
          gridLineWidth: 1,
          //minorTickInterval: 'auto',
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
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: true,
          gridLineWidth: 1,
          //minorTickInterval: 'auto', // TODO: this one may cause problem, check if needed
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
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        style: {
          fontSize: '15px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        shared: true,
        outside: false,
        useHTML: true,
        xDateFormat: '%A, %b %e, %Y',
        headerFormat: `<p style="color:${ColorScheme.GRAY_DARK_VAR}; font-size: 12px">{point.key}</p>`,

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
            <div class="min-w-[85px]" style="color: ${ColorScheme.GRAY_DARK_VAR}">${value}</div>
            <div style="color: ${ColorScheme.GRAY_DARK_STRONG_VAR}">${unitsOnDate ? `[${unitsOnDate}]` : ''}</div>
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
