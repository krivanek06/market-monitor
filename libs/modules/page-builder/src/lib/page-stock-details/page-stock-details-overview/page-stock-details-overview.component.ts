import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StockSummary } from '@market-monitor/api-types';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general/features';
import {
  EarningsEstimationChartComponent,
  RevenueEstimationChartComponent,
  ShowStockDialogDirective,
  StockEnterpriseChartComponent,
  StockEsgDataTableComponent,
  StockKeyExecutivesTableComponent,
  StockPeersListComponent,
  StockPriceTargetTableComponent,
  StockRatingTableComponent,
  StockRecommendationChartComponent,
  StockSummaryListComponent,
  StockUpgradesDowngradesTableComponent,
} from '@market-monitor/modules/market-stocks/ui';
import {
  GeneralCardComponent,
  GenericChartComponent,
  NameValueListComponent,
  PriceChangeItemsComponent,
  SortByKeyPipe,
} from '@market-monitor/shared/ui';
import { DialogServiceModule } from '@market-monitor/shared/utils-client';
import { StockTransformService } from '@market-monitor/shared/utils-transform';
import { of, switchMap } from 'rxjs';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-details-overview',
  standalone: true,
  imports: [
    CommonModule,
    DialogServiceModule,
    GenericChartComponent,
    GeneralCardComponent,
    StockRatingTableComponent,
    StockRecommendationChartComponent,
    StockEsgDataTableComponent,
    EarningsEstimationChartComponent,
    RevenueEstimationChartComponent,
    StockKeyExecutivesTableComponent,
    StockUpgradesDowngradesTableComponent,
    StockPriceTargetTableComponent,
    PriceChangeItemsComponent,
    AssetPriceChartInteractiveComponent,
    NameValueListComponent,
    StockSummaryListComponent,
    StockEnterpriseChartComponent,
    StockPeersListComponent,
    SortByKeyPipe,
  ],
  templateUrl: './page-stock-details-overview.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ShowStockDialogDirective],
})
export class PageStockDetailsOverviewComponent extends PageStockDetailsBase {
  private stockTransformService = inject(StockTransformService);
  private showStockDialogDirective = inject(ShowStockDialogDirective);

  stockPeersSignal = toSignal(
    this.stockDetails$.pipe(
      switchMap((details) => {
        if (!details.sectorPeers || details.sectorPeers.peersList.length === 0) {
          return of([]);
        }
        return this.stocksApiService.getStockSummaries(details.sectorPeers.peersList);
      }),
    ),
  );

  companyRatingSignal = computed(() => this.stockTransformService.createCompanyRatingTable(this.stockDetailsSignal()));
  estimationChartDataSignal = computed(
    computed(() => this.stockTransformService.createEstimationData(this.stockDetailsSignal())),
  );
  financialStrengthSignal = computed(() =>
    this.stockTransformService.createFinancialStrength(this.stockDetailsSignal()),
  );
  financialRatio1Signal = computed(() => this.stockTransformService.createFinancialRatio1(this.stockDetailsSignal()));
  financialRatio2Signal = computed(() => this.stockTransformService.createFinancialRatio2(this.stockDetailsSignal()));
  financialPerShareSignal = computed(() =>
    this.stockTransformService.createFinancialPerShare(this.stockDetailsSignal()),
  );
  financialOperatingSignal = computed(() =>
    this.stockTransformService.createFinancialOperatingData(this.stockDetailsSignal()),
  );
  financialDividendsSignal = computed(() =>
    this.stockTransformService.createFinancialDividends(this.stockDetailsSignal()),
  );

  constructor() {
    super();
  }

  onShowSummary(summary: StockSummary) {
    // show summary
    this.showStockDialogDirective.onShowSummary(summary.id);
  }
}
