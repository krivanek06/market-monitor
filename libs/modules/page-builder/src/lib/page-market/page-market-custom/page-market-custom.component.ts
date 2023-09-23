import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { MARKET_OVERVIEW_DATA, MarketOverviewDatabaseKeys, getMarketOverKeyBySubKey } from '@market-monitor/api-types';
import { MarketApiService } from '@market-monitor/modules/market-general/data-access';
import { MarketOverviewChartDataBody, RouterManagement } from '@market-monitor/shared/data-access';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  GenericChartComponent,
  InArrayPipe,
  ObjectArrayValueByKeyPipe,
} from '@market-monitor/shared/ui';
import { MarketDataTransformService } from '@market-monitor/shared/utils-transform';
import { isBefore } from 'date-fns';
import { forkJoin, map } from 'rxjs';

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
export class PageMarketCustomComponent implements OnInit, RouterManagement {
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  MARKET_OVERVIEW_DATA = MARKET_OVERVIEW_DATA;

  /**
   * date range control for user to manually select date range in custom chart
   */
  dateRangeControl = new FormControl<DateRangeSliderValues | null>(null);

  /**
   * both signals keep the selected data and values
   */
  selectedOverviewSignal = signal<MarketOverviewChartDataBody[]>([]);

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
  selectedOverviewSubKeys = computed(() => this.selectedOverviewSignal().map((data) => data.subKey));

  constructor() {
    effect(() => this.updateQueryParams(this.selectedOverviewSubKeys()));
  }

  ngOnInit(): void {
    this.loadQueryParams();
  }

  onDataClick(key: MarketOverviewDatabaseKeys, subKey: string, sectionName: string): void {
    // if subKey is already selected, remove it
    if (this.selectedOverviewSubKeys().includes(subKey)) {
      this.selectedOverviewSignal.update((prev) => prev.filter((data) => data.subKey !== subKey));
      const nextCurrentDates = this.selectedOverviewSignal().at(0)?.marketOverview?.dates ?? [];
      this.updateDateRangeControl(nextCurrentDates, true);
      return;
    }

    // else add it and load data
    this.showLoadingScreenSignal.set(true);
    this.marketApiService.getMarketOverviewData(key, subKey).subscribe((marketOverviewData) => {
      // sometimes dates are in reverse order
      marketOverviewData.dates = isBefore(new Date(marketOverviewData.dates[0]), new Date(marketOverviewData.dates[1]))
        ? marketOverviewData.dates.reverse()
        : marketOverviewData.dates;

      //  console.log('marketOverviewData', marketOverviewData.dates);

      // transform data
      const data = this.marketDataTransformService.transformMarketOverviewData(sectionName, marketOverviewData, subKey);

      // add data to signal
      this.selectedOverviewSignal.update((prev) => [...prev, data]);

      // hide loading screen
      this.showLoadingScreenSignal.set(false);

      // update date range control
      this.updateDateRangeControl(marketOverviewData.dates);
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

  updateQueryParams(values: string[]): void {
    const sections = values.join(',');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sections,
      },
    });
  }

  loadQueryParams(): void {
    // i.e: usCpi,euCpi,ukCpi
    const subKeys = this.route.snapshot.queryParams['sections'];
    if (subKeys) {
      const subKeysArray = subKeys.split(',') as string[];
      this.showLoadingScreenSignal.set(true);

      // load all market overview data at once
      forkJoin(
        subKeysArray
          .map((subKey) => getMarketOverKeyBySubKey(subKey))
          .filter(
            // ignoring unknown subKeys
            (overview): overview is { key: MarketOverviewDatabaseKeys; name: string; subKey: string } => !!overview,
          )
          .map((overview) =>
            this.marketApiService
              .getMarketOverviewData(overview.key, overview.subKey)
              .pipe(
                map((marketOverviewData) =>
                  this.marketDataTransformService.transformMarketOverviewData(
                    overview.name,
                    marketOverviewData,
                    overview.subKey,
                  ),
                ),
              ),
          ),
      ).subscribe((marketOverviewData) => {
        // hide loading screen
        this.showLoadingScreenSignal.set(false);
        // add data to signal
        this.selectedOverviewSignal.update((prev) => [...prev, ...marketOverviewData]);
        // select the longest date range
        const maxDates = marketOverviewData
          .map((d) => d.marketOverview.dates.length)
          .reduce((acc, curr) => Math.max(acc, curr), 0);
        const longestDateRange = marketOverviewData.find((d) => d.marketOverview.dates.length === maxDates);
        if (longestDateRange) {
          this.updateDateRangeControl(longestDateRange.marketOverview.dates);
        }
      });
    }
  }
}
