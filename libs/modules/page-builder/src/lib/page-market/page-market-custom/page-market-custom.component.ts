import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
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
  templateUrl: './page-market-custom.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PageMarketCustomComponent implements OnInit {
  marketApiService = inject(MarketApiService);
  router = inject(Router);
  route = inject(ActivatedRoute);

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

  // constructor() {
  //   effect(() => this.updateQueryParams(this.selectedOverviewSubKeys()));
  // }

  ngOnInit(): void {
    // this.loadQueryParams();
  }

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
