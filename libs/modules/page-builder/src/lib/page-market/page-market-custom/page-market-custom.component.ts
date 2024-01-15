import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarketApiService } from '@market-monitor/api-client';
import {
  MARKET_OVERVIEW_ENDPOINTS,
  MarketOverviewKey,
  MarketOverviewName,
  MarketOverviewSubkeyReadable,
} from '@market-monitor/api-types';
import { GenericChartSeries } from '@market-monitor/shared/data-access';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  GenericChartComponent,
  InArrayPipe,
  ObjectArrayValueByKeyPipe,
} from '@market-monitor/shared/ui';
import { format, isBefore } from 'date-fns';
import { map } from 'rxjs';

@Component({
  selector: 'app-page-market-custom',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    InArrayPipe,
    GenericChartComponent,
    MatProgressSpinnerModule,
    ObjectArrayValueByKeyPipe,
    DateRangeSliderComponent,
    ReactiveFormsModule,
  ],
  template: `
    <!-- slider to change dates -->
    <div>
      <app-date-range-slider [formControl]="dateRangeControl" class="w-[600px]"></app-date-range-slider>
    </div>

    <!-- chart -->
    <div class="relative w-full mb-10" [ngClass]="{ 'g-shadow-background': showLoadingScreenSignal() }">
      <app-generic-chart
        [series]="selectedChartDataSignal()"
        [heightPx]="450"
        [enableZoom]="true"
        [enableLegendTogging]="true"
        [showLegend]="true"
        [shareTooltip]="false"
        [chartDateRestriction]="chartDateRestriction()"
      ></app-generic-chart>

      <mat-spinner *ngIf="showLoadingScreenSignal()" class="g-absolute-center" diameter="80"></mat-spinner>
    </div>

    <!-- options -->
    <div class="flex flex-col w-full gap-6 mx-auto sm:px-4 lg:w-10/12">
      <!-- sp500 -->
      <h2 class="mb-0 text-lg text-wt-gray-dark">S&P 500</h2>
      <div class="flex flex-wrap items-center gap-x-2">
        <button
          *ngFor="let dataSection of MARKET_OVERVIEW_ENDPOINTS.sp500.data"
          (click)="onDataClick('sp500', dataSection.keyReadable, dataSection.name)"
          mat-button
          type="button"
          [color]="(selectedOverviewSubKeys() | inArray: dataSection.keyReadable) ? 'primary' : ''"
          class="text-sm"
        >
          {{ dataSection.name }}
        </button>
      </div>

      <!-- bonds -->
      <h2 class="mb-0 text-lg text-wt-gray-dark">Bonds</h2>
      <div class="flex flex-wrap items-center gap-x-2">
        <button
          *ngFor="let dataSection of MARKET_OVERVIEW_ENDPOINTS.bonds.data"
          (click)="onDataClick('bonds', dataSection.keyReadable, dataSection.name)"
          mat-button
          type="button"
          [color]="(selectedOverviewSubKeys() | inArray: dataSection.keyReadable) ? 'primary' : ''"
          class="text-sm"
        >
          {{ dataSection.name }}
        </button>
      </div>

      <!-- treasury -->
      <h2 class="mb-0 text-lg text-wt-gray-dark">Treasury</h2>
      <div class="flex flex-wrap items-center gap-x-2">
        <button
          *ngFor="let dataSection of MARKET_OVERVIEW_ENDPOINTS.treasury.data"
          (click)="onDataClick('treasury', dataSection.keyReadable, dataSection.name)"
          mat-button
          type="button"
          [color]="(selectedOverviewSubKeys() | inArray: dataSection.keyReadable) ? 'primary' : ''"
          class="text-sm"
        >
          {{ dataSection.name }}
        </button>
      </div>

      <!-- Bitcoin -->
      <h2 class="mb-0 text-lg text-wt-gray-dark">Bitcoin</h2>
      <div class="flex flex-wrap items-center gap-x-2">
        <button
          *ngFor="let dataSection of MARKET_OVERVIEW_ENDPOINTS.bitcoin.data"
          (click)="onDataClick('bitcoin', dataSection.keyReadable, dataSection.name)"
          mat-button
          type="button"
          [color]="(selectedOverviewSubKeys() | inArray: dataSection.keyReadable) ? 'primary' : ''"
          class="text-sm"
        >
          {{ dataSection.name }}
        </button>
      </div>

      <!-- US data -->
      <h2 class="mb-0 text-lg text-wt-gray-dark">US General</h2>
      <div class="flex flex-wrap items-center gap-x-2">
        <button
          *ngFor="let dataSection of MARKET_OVERVIEW_ENDPOINTS.general.data"
          (click)="onDataClick('general', dataSection.keyReadable, dataSection.name)"
          mat-button
          type="button"
          [color]="(selectedOverviewSubKeys() | inArray: dataSection.keyReadable) ? 'primary' : ''"
          class="text-sm"
        >
          {{ dataSection.name }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        display: block;
      }
  `,
})
export class PageMarketCustomComponent {
  marketApiService = inject(MarketApiService);
  MARKET_OVERVIEW_ENDPOINTS = MARKET_OVERVIEW_ENDPOINTS;

  /**
   * date range control for user to manually select date range in custom chart
   */
  dateRangeControl = new FormControl<DateRangeSliderValues | null>(null);

  /**
   * both signals keep the selected data and values
   */
  selectedChartDataSignal = signal<GenericChartSeries<[number, number]>[]>([]);

  /**
   * restricting the chart to show only the selected date range
   */
  chartDateRestriction = toSignal<[Date | string, Date | string] | undefined>(
    this.dateRangeControl.valueChanges.pipe(
      map((dateRange) => {
        if (!dateRange) {
          return undefined;
        }
        const startDate = dateRange.dates[dateRange.currentMinDateIndex];
        const endDate = dateRange.dates[dateRange.currentMaxDateIndex];
        return [startDate, endDate];
      }),
    ),
  );

  showLoadingScreenSignal = signal<boolean>(false);
  selectedOverviewSubKeys = computed(() => this.selectedChartDataSignal().map((data) => data.additionalData?.id!));

  onDataClick<T extends MarketOverviewKey>(
    key: T,
    subKey: MarketOverviewSubkeyReadable<T>,
    subKeyName: MarketOverviewName<T>,
  ): void {
    // if subKey is already selected, remove it
    if (this.selectedOverviewSubKeys().includes(subKey)) {
      // filter out data
      this.selectedChartDataSignal.update((prev) => prev.filter((data) => data.additionalData?.id !== subKey));
      // update date range control
      const nextCurrentDates = this.selectedChartDataSignal()[0]?.data?.map((d) => format(d[0], 'YYYY-MM-DD')) ?? [];
      this.updateDateRangeControl(nextCurrentDates, true);
      return;
    }

    // else add it and load data
    this.showLoadingScreenSignal.set(true);
    this.marketApiService.getMarketOverviewData(key, subKey).subscribe((marketOverviewData) => {
      // transform data
      const displayName = `${MARKET_OVERVIEW_ENDPOINTS[key].name} - ${subKeyName}`;
      const chartData: GenericChartSeries<[number, number]> = {
        name: displayName,
        additionalData: {
          showCurrencySign: false,
          id: subKey,
        },
        //color: color,
        data: marketOverviewData.reduce(
          (acc, [date, value]) => [[new Date(date).getTime(), value], ...acc],
          [] as [number, number][],
        ),
      };

      // add data to signal
      this.selectedChartDataSignal.update((prev) => [...prev, chartData]);

      // hide loading screen
      this.showLoadingScreenSignal.set(false);

      // update date range control
      this.updateDateRangeControl(marketOverviewData.map((d) => d[0]));
    });
  }

  private updateDateRangeControl(dates: string[], resetCurrentValue = false): void {
    if (resetCurrentValue) {
      if (dates.length > 0) {
        // not emitting event to redrawing charts
        this.dateRangeControl.patchValue(null, { emitEvent: false });
      } else {
        this.dateRangeControl.patchValue(null);
      }
    }

    if (dates.length === 0) {
      return;
    }

    // bug that `dates` are in different order
    const sortedDates = dates.sort((a, b) => (isBefore(new Date(a), new Date(b)) ? -1 : 1));

    // save & reset the date range
    const currentDate = this.dateRangeControl.value;
    this.dateRangeControl.patchValue({
      dates: currentDate && currentDate.dates.length > dates.length ? currentDate.dates : sortedDates,
      currentMaxDateIndex:
        currentDate?.dates && currentDate.dates.length > dates.length
          ? currentDate.currentMaxDateIndex
          : dates.length - 1,
      currentMinDateIndex: 0,
    });
  }
}
