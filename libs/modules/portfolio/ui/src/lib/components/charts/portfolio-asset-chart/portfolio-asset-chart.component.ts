import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PortfolioGrowthAssets, PortfolioTransaction } from '@mm/api-types';
import { PortfolioCalculationService } from '@mm/portfolio/data-access';
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
  DropdownControlComponent,
  filterDataByTimestamp,
} from '@mm/shared/ui';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { from, map, share, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-portfolio-asset-chart',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    DefaultImgDirective,
    MatButtonModule,
    HighchartsChartModule,
    DateRangeSliderComponent,
    DropdownControlComponent,
  ],
  template: `
    <div class="mb-4 flex items-center justify-between gap-x-6">
      <app-dropdown-control
        inputCaption="Select Symbol"
        displayImageType="symbol"
        inputType="MULTISELECT"
        class="w-full lg:w-[420px]"
        [formControl]="symbolsControl"
        [inputSource]="symbolInputSource()"
      />

      <!-- time slider -->
      <div class="flex justify-end" [ngClass]="{ hidden: selectedSymbol().length === 0 }">
        <app-date-range-slider class="hidden w-[450px] md:block" [formControl]="dateRangeControl" />
      </div>
    </div>

    <!-- chart -->
    @if (selectedSymbol().length > 0) {
      @if (chartOptionsSignal(); as chartOptionsSignal) {
        @if (chartOptionsSignal.loaded) {
          <highcharts-chart
            [Highcharts]="Highcharts"
            [options]="chartOptionsSignal.series"
            [callbackFunction]="chartCallback"
            [style.height.px]="heightPx()"
            style="width: 100%; display: block"
          />
        } @else {
          <div class="g-skeleton" [style.height.px]="heightPx()"></div>
        }
      }
    } @else {
      <div class="grid place-content-center text-base" [style.height.px]="heightPx() + 100">No data available</div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioAssetChartComponent extends ChartConstructor {
  private readonly portfolioCalculationService = inject(PortfolioCalculationService);

  /**
   * user's all portfolio transactions
   */
  readonly data = input<PortfolioTransaction[]>([]);

  /**
   * selected symbols by the user
   */
  readonly symbolsControl = new FormControl<string[]>([], { nonNullable: true });

  /**
   * data range control for chart zoom
   */
  readonly dateRangeControl = new FormControl<DateRangeSliderValues>(
    {
      currentMaxDateIndex: 0,
      currentMinDateIndex: 0,
      dates: [],
    },
    { nonNullable: true },
  );

  /**
   * every symbol which has been transacted
   */
  readonly transactedSymbols = computed(() => this.portfolioCalculationService.getTransactionSymbols(this.data()));

  /**
   * displayed symbols on the ui
   */
  readonly symbolInputSource = computed(() =>
    this.transactedSymbols().map(
      (asset) =>
        ({ caption: asset.displaySymbol, value: asset.symbol, image: asset.symbol }) satisfies InputSource<string>,
    ),
  );

  /**
   * signal value of the selected date range
   */
  readonly dateRangeControlData = toSignal(
    this.dateRangeControl.valueChanges.pipe(startWith(this.dateRangeControl.value)),
    { initialValue: this.dateRangeControl.value },
  );

  /**
   * symbols which user selected to make comparison
   */
  readonly selectedSymbol = toSignal(this.symbolsControl.valueChanges, { initialValue: [] });

  /**
   * save provided data into the component
   */
  readonly chartOptionsSignal = computed(() => {
    const dateRange = this.dateRangeControlData();
    const growthAssets = this.selectedSymbolsPortfolioGrowthAssets();

    // data not yet loaded, display skeleton
    if (!growthAssets.loaded) {
      return { loaded: false, series: {} };
    }

    const series = this.formatData(growthAssets.data);
    const newData = series.map((d) => ({
      ...d,
      data: filterDataByTimestamp(d.data as [number, number][], dateRange),
    })) satisfies Highcharts.SeriesOptionsType[];

    return { loaded: true, series: this.initChart(newData) };
  });

  /**
   * loaded portfolio growth for selected symbols
   */
  private readonly selectedSymbolsPortfolioGrowthAssets = toSignal(
    this.symbolsControl.valueChanges.pipe(startWith(this.symbolsControl.value)).pipe(
      // filter out transactions which are related to this symbols
      map((symbol) => this.data().filter((d) => symbol.includes(d.symbol))),
      // load historical data, calculate assets growth
      switchMap((transactions) =>
        from(this.portfolioCalculationService.getPortfolioGrowthAssets(transactions)).pipe(
          map((data) => ({ loaded: true, data })),
          startWith({ loaded: false, data: [] }),
        ),
      ),
      share(),
    ),
    { initialValue: { loaded: false, data: [] } },
  );

  /**
   * effect to patch value to the slider based on the selected symbols
   */
  readonly dateRangeEffect = effect(() => {
    const growthAssets = this.selectedSymbolsPortfolioGrowthAssets();

    // nothing is selected or empty data
    if (growthAssets.data.length === 0) {
      untracked(() => {
        this.dateRangeControl.patchValue({
          currentMaxDateIndex: 0,
          currentMinDateIndex: 0,
          dates: [],
        });
      });
      return;
    }

    // create range of dates from the minimal date to the current date up to today
    const minDate = growthAssets.data.reduce(
      (acc, curr) => (curr.data[0].date < acc ? curr.data[0].date : acc),
      getCurrentDateDefaultFormat(),
    );

    // generate missing dates between minDate and today
    const missingDates = fillOutMissingDatesForDate(minDate, new Date());

    untracked(() => {
      // set value to the form
      this.dateRangeControl.patchValue({
        currentMaxDateIndex: missingDates.length - 1,
        currentMinDateIndex: 0,
        dates: missingDates,
      });
    });
  });

  /** chart is empty by default so select some symbol as default ones */
  readonly displayInitialDataEffect = effect(() => {
    //const data = this.data() ?? [];
    const transactedSymbols = this.transactedSymbols();
    // limit initial symbols that are displayed
    const symbolLimit = 5;

    untracked(() => {
      // display top N symbol
      const displaySymbols = transactedSymbols.map((d) => d.symbol).slice(0, symbolLimit);

      // save symbols into the form
      this.symbolsControl.patchValue(displaySymbols);
    });
  });

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
   * @returns formatted PortfolioGrowthAssets with the selected symbols into the Highcharts.SeriesOptionsType
   */
  private formatData(portfolioAssets: PortfolioGrowthAssets[]): GenericChartSeries<'line' | 'column'>[] {
    const seriesData = portfolioAssets.map(
      (d, index) =>
        ({
          type: 'line',
          name: d.symbol,
          data: d.data.map((g) => [Date.parse(g.date), g.marketTotal]),
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
