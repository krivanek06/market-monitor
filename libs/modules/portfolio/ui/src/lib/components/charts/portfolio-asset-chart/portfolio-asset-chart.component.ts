import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PortfolioGrowthAssets } from '@market-monitor/api-types';
import { ChartConstructor, ColorScheme, InputSource, getChartGenericColor } from '@market-monitor/shared/data-access';
import { formatValueIntoCurrency } from '@market-monitor/shared/features/general-util';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { Subject, map, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-portfolio-asset-chart',
  standalone: true,
  imports: [
    CommonModule,
    HighchartsChartModule,
    MatChipsModule,
    ReactiveFormsModule,
    DefaultImgDirective,
    MatButtonModule,
  ],
  template: `
    <!-- show all -->
    <div class="flex justify-end mb-2">
      <button *ngIf="symbolsControl.value.length > 0" mat-stroked-button type="button" (click)="onHideAll()">
        Hide All
      </button>
    </div>

    <!-- list of symbols -->
    <mat-chip-listbox aria-label="Asset Selection" [multiple]="true" [formControl]="symbolsControl">
      <mat-chip-option *ngFor="let inputSource of symbolInputSourceSignal()" class="h-10 mb-3 mr-1 g-mat-chip">
        <div class="flex flex-wrap items-center gap-4 px-2">
          <img appDefaultImg imageType="symbol" [src]="inputSource.value" [alt]="inputSource.caption" class="h-7" />
          <span class="text-base">{{ inputSource.caption }}</span>
        </div>
      </mat-chip-option>
    </mat-chip-listbox>

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
export class PortfolioAssetChartComponent extends ChartConstructor {
  @Input({ required: true }) set data(input: PortfolioGrowthAssets[]) {
    this.portfolioGrowthAssets$.next(input);
  }
  symbolInputSourceSignal = signal<InputSource<string>[]>([]);

  symbolsControl = new FormControl<string[]>([], {
    nonNullable: true,
  });

  private portfolioGrowthAssets$ = new Subject<PortfolioGrowthAssets[]>();

  constructor() {
    super();
    this.initChart([]);

    // map portfolio assets into input source
    this.portfolioGrowthAssets$
      .pipe(
        map((portfolioAssets) =>
          portfolioAssets.map(
            (asset) => ({ caption: asset.symbol, value: asset.symbol }) satisfies InputSource<string>,
          ),
        ),
        // takeUntilDestroyed(),
      )
      .subscribe((res) => this.symbolInputSourceSignal.set(res));

    this.portfolioGrowthAssets$
      .pipe(
        switchMap((portfolioAssets) =>
          this.symbolsControl.valueChanges.pipe(
            startWith(this.symbolsControl.value),
            // get only symbols that are selected
            map((symbolsArray) => portfolioAssets.filter((asset) => symbolsArray.includes(asset.symbol))),
            // map growth into chart data
            map((data) =>
              data
                // filter out data that has no values
                // .map((series) => {
                //   return { ...series, data: series.data.filter((d) => d[1] > 0) };
                // })

                // create series data for chart
                .map((d, index) => {
                  console.log('getChartGenericColor(index)', getChartGenericColor(index));
                  const result: Highcharts.SeriesLineOptions = {
                    type: 'line',
                    name: d.symbol,
                    data: d.data.map((g) => [Date.parse(g.date), g.marketTotalValue]),
                    yAxis: 1,
                    color: getChartGenericColor(index),
                  };
                  return result;
                }),
            ),
            // include line series for total
            map((seriesData) => {
              const totalSeriesData = seriesData.reduce(
                (acc, curr) => {
                  // [number, number] => [timestamp, value]
                  const currData = curr.data as [number, number][]; // cast to correct type
                  const accData = acc.data as [number, number][]; // cast to correct type

                  // check if data in acc
                  for (const data of currData) {
                    const timestamp = data[0]; // timestamp
                    const value = data[1]; // value

                    // get index of existing timestamp in acc
                    const accDataIndex = accData.findIndex((d) => d[0] === timestamp);

                    // if timestamp exists in acc, add value to existing value
                    if (accDataIndex > -1) {
                      accData[accDataIndex][1] += value;
                    }
                    // empty array or add value at the end of the array if timestamp higher than last element
                    else if (accData.length === 0 || timestamp > accData[accData.length - 1][0]) {
                      accData.push(data);
                    } else {
                      // find the index of timestamp in the middle of the array, however timestamp does not yet exists
                      const index = accData.findIndex((d, i) => timestamp > d[0] && timestamp < accData[i + 1][0]);
                      // add value at the beginning of the array if timestamp lower than first element
                      const usedIndex = index > -1 ? index : 0;
                      // inset data into accData in index position
                      accData.splice(usedIndex, 0, data);
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
            }),
            //takeUntilDestroyed(),
          ),
        ),
      )
      .subscribe((result) => this.initChart(result));
  }

  onHideAll(): void {
    this.symbolsControl.patchValue([]);
  }

  private initChart(result: Highcharts.SeriesOptionsType[]) {
    console.log('initing chart', result);
    // const balance = (result[0]?.data ?? []) as [number, number][];
    // const dates = balance.map((d) => format(d[0], 'MMM dd, yyyy'));

    this.chartOptions = {
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
        {
          title: {
            text: '',
          },
          startOnTick: false,
          endOnTick: false,
          gridLineColor: '#66666655',
          opposite: true,
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
        type: 'datetime',
        crosshair: true,
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
      plotOptions: {
        series: {
          borderWidth: 2,
          enableMouseTracking: true,
        },
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
          const value = formatValueIntoCurrency(this.y);

          const name = this.series.name.toUpperCase();

          return `<p><span style="color: ${this.series.color}; font-weight: bold" class="capitalize">● ${name}: </span><span>${value}</span></p><br/>`;
        },
      },
      series: result,
    };
  }
}
