import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StockSummary } from '@market-monitor/api-types';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general';
import {
  EarningsEstimationChartComponent,
  RevenueEstimationChartComponent,
  StockEnterpriseChartComponent,
  StockEsgDataTableComponent,
  StockKeyExecutivesTableComponent,
  StockPeersListComponent,
  StockPriceTargetTableComponent,
  StockRatingTableComponent,
  StockRecommendationChartComponent,
  StockSummaryDialogComponent,
  StockSummaryListComponent,
  StockTransformService,
  StockUpgradesDowngradesTableComponent,
} from '@market-monitor/modules/market-stocks';
import {
  GeneralCardComponent,
  GenericChartComponent,
  NameValueListComponent,
  PriceChangeItemsComponent,
} from '@market-monitor/shared-components';
import { DialogServiceModule, SCREEN_DIALOGS } from '@market-monitor/shared-utils-client';
import { map } from 'rxjs';
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
})
export class PageStockDetailsOverviewComponent extends PageStockDetailsBase {
  stockTransformService = inject(StockTransformService);

  stockPeersSignal = toSignal(
    this.stocksApiService
      .getStockSummaries(this.stockDetailsSignal().sectorPeers.peersList ?? [])
      .pipe(map((summaries) => summaries ?? [])),
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
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
