import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { MarketOverviewDatabaseKeys } from '@market-monitor/api-types';
import {
  MARKET_OVERVIEW_DATA,
  MarketDataTransformService,
  getMarketOverKeyBySubKey,
} from '@market-monitor/modules/market-general';
import { GenericChartComponent, GenericChartSeries } from '@market-monitor/shared-components';
import { InArrayPipe } from '@market-monitor/shared-pipes';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-market-custom',
  standalone: true,
  imports: [CommonModule, MatButtonModule, InArrayPipe, GenericChartComponent],
  templateUrl: './market-custom.component.html',
  styleUrls: ['./market-custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketCustomComponent implements OnInit {
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  MARKET_OVERVIEW_DATA = MARKET_OVERVIEW_DATA;

  /**
   * both signals keep the selected data and values
   */
  selectedChartDataSignal = signal<GenericChartSeries[]>([]);
  selectedSubKeysSignal = signal<string[]>([]);

  ngOnInit(): void {
    this.loadQueryParams();
  }

  onDataClick<T extends MarketOverviewDatabaseKeys>(key: T, subKey: string, sectionName: string): void {
    console.log(key, subKey, sectionName);
    const subKeyCasted = String(subKey);

    // if subKey is already selected, remove it
    if (this.selectedSubKeysSignal().includes(subKeyCasted)) {
      this.selectedChartDataSignal.update((prev) => prev.filter((data) => data.name !== sectionName));
      this.selectedSubKeysSignal.update((prev) => prev.filter((value) => value !== subKeyCasted));
    } else {
      // else add it and load data
      this.selectedSubKeysSignal.update((prev) => [...prev, String(subKey)]);
      this.marketApiService.getMarketOverviewData(key, subKey).subscribe((marketOverviewData) => {
        const data = this.marketDataTransformService.transformMarketOverviewData(sectionName, marketOverviewData);
        this.selectedChartDataSignal.update((prev) => [...prev, data.chartData]);
      });
    }
    this.updateQueryParams();
  }

  private updateQueryParams(): void {
    const queryParams: Params = { sections: this.selectedSubKeysSignal().join(',') };
    this.router.navigate([], { relativeTo: this.route, queryParams });
  }

  private loadQueryParams(): void {
    // i.e: usCpi,euCpi,ukCpi
    const subKeys = this.route.snapshot.queryParams['sections'];
    if (subKeys) {
      const subKeysArray = subKeys.split(',') as string[];
      this.selectedSubKeysSignal.update(() => subKeysArray);

      // load all market overview data at once
      forkJoin(
        subKeysArray
          .map((subKey) => getMarketOverKeyBySubKey(subKey))
          .filter(
            (overview): overview is { key: MarketOverviewDatabaseKeys; name: string; subKey: string } => !!overview
          )
          .map((overview) =>
            this.marketApiService
              .getMarketOverviewData(overview.key, overview.subKey)
              .pipe(
                map((marketOverviewData) =>
                  this.marketDataTransformService.transformMarketOverviewData(overview.name, marketOverviewData)
                )
              )
          )
      ).subscribe((marketOverviewData) => {
        this.selectedChartDataSignal.update((prev) => [...prev, ...marketOverviewData.map((data) => data.chartData)]);
      });
    }
  }
}
