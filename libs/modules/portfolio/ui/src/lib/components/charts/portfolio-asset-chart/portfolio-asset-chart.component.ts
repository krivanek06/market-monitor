import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PortfolioGrowthAssets } from '@market-monitor/api-types';
import { ColorScheme, InputSource, getChartGenericColor } from '@market-monitor/shared/data-access';
import { DefaultImgDirective, GenericChartComponent } from '@market-monitor/shared/ui';
import * as Highcharts from 'highcharts';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

@Component({
  selector: 'app-portfolio-asset-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    ReactiveFormsModule,
    DefaultImgDirective,
    MatButtonModule,
    GenericChartComponent,
  ],
  template: `
    <!-- list of symbols -->
    <mat-chip-listbox aria-label="Asset Selection" [multiple]="true" [formControl]="symbolsControl" class="mt-2">
      <mat-chip-option *ngFor="let inputSource of symbolInputSourceSignal()" class="h-10 mb-3 mr-1 g-mat-chip">
        <div class="flex flex-wrap items-center gap-4 px-2">
          <img appDefaultImg imageType="symbol" [src]="inputSource.value" [alt]="inputSource.caption" class="h-7" />
          <span class="text-base">{{ inputSource.caption }}</span>
        </div>
      </mat-chip-option>
    </mat-chip-listbox>

    <app-generic-chart chartType="line" [showLegend]="true" [series]="chartDataSignal()" />
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioAssetChartComponent {
  @Input({ required: true }) set data(input: PortfolioGrowthAssets[]) {
    const inputSource = input.map(
      (asset) => ({ caption: asset.symbol, value: asset.symbol }) satisfies InputSource<string>,
    );
    this.symbolInputSourceSignal.set(inputSource);
    this.symbolsControl.setValue([]);
    this.portfolioGrowth$.next(input);
  }
  symbolInputSourceSignal = signal<InputSource<string>[]>([]);

  symbolsControl = new FormControl<string[]>([], {
    nonNullable: true,
  });
  private portfolioGrowth$ = new BehaviorSubject<PortfolioGrowthAssets[]>([]);

  chartDataSignal = toSignal(
    combineLatest([
      this.portfolioGrowth$.asObservable(),
      this.symbolsControl.valueChanges.pipe(startWith(this.symbolsControl.value)),
    ]).pipe(map(([portfolioAssets, selectedSymbols]) => this.formatData(portfolioAssets, selectedSymbols))),
    { initialValue: [] },
  );

  private formatData(
    portfolioAssets: PortfolioGrowthAssets[],
    selectedSymbols: string[],
  ): Highcharts.SeriesOptionsType[] {
    const portfolioFiltered = portfolioAssets.filter((asset) => selectedSymbols.includes(asset.symbol));
    const seriesData = portfolioFiltered.map(
      (d, index) =>
        ({
          type: 'line',
          name: d.symbol,
          data: d.data.map((g) => [Date.parse(g.date), g.marketTotalValue]),
          yAxis: 1,
          color: getChartGenericColor(index),
        }) satisfies Highcharts.SeriesLineOptions,
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
