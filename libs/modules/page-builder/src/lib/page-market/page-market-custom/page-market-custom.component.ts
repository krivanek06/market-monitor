import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketApiService } from '@market-monitor/api-client';
import { MARKET_OVERVIEW_DATA, MarketOverviewDatabaseKeys, getMarketOverKeyBySubKey } from '@market-monitor/api-types';
import { MarketDataTransformService, MarketOverviewChartDataBody } from '@market-monitor/modules/market-general';
import { GenericChartComponent } from '@market-monitor/shared-components';
import { InArrayPipe, ObjectArrayValueByKeyPipe } from '@market-monitor/shared-pipes';
import { RouterManagement } from '@market-monitor/shared-utils-client';
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
  ],
  templateUrl: './page-market-custom.component.html',
  styleUrls: ['./page-market-custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMarketCustomComponent implements OnInit, RouterManagement {
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  MARKET_OVERVIEW_DATA = MARKET_OVERVIEW_DATA;

  /**
   * both signals keep the selected data and values
   */
  selectedOverviewSignal = signal<MarketOverviewChartDataBody[]>([]);
  selectedOverviewSubKeys = computed(() => this.selectedOverviewSignal().map((data) => data.subKey));

  constructor() {
    effect(() => this.updateQueryParams(this.selectedOverviewSubKeys()));
  }

  showLoadingScreenSignal = signal<boolean>(false);

  ngOnInit(): void {
    this.loadQueryParams();
  }

  onDataClick(key: MarketOverviewDatabaseKeys, subKey: string, sectionName: string): void {
    console.log(key, subKey, sectionName);

    // if subKey is already selected, remove it
    if (this.selectedOverviewSubKeys().includes(subKey)) {
      this.selectedOverviewSignal.update((prev) => prev.filter((data) => data.subKey !== subKey));
      return;
    }

    // else add it and load data
    this.showLoadingScreenSignal.set(true);
    this.marketApiService.getMarketOverviewData(key, subKey).subscribe((marketOverviewData) => {
      const data = this.marketDataTransformService.transformMarketOverviewData(sectionName, marketOverviewData, subKey);
      this.selectedOverviewSignal.update((prev) => [...prev, data]);
      this.showLoadingScreenSignal.set(false);
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
            (overview): overview is { key: MarketOverviewDatabaseKeys; name: string; subKey: string } => !!overview
          )
          .map((overview) =>
            this.marketApiService
              .getMarketOverviewData(overview.key, overview.subKey)
              .pipe(
                map((marketOverviewData) =>
                  this.marketDataTransformService.transformMarketOverviewData(
                    overview.name,
                    marketOverviewData,
                    overview.subKey
                  )
                )
              )
          )
      ).subscribe((marketOverviewData) => {
        console.log(marketOverviewData);
        this.showLoadingScreenSignal.set(false);
        this.selectedOverviewSignal.update((prev) => [...prev, ...marketOverviewData]);
        console.log(this.selectedOverviewSignal());
      });
    }
  }
}
