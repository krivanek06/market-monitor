import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { SymbolSummary } from '@mm/api-types';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { StockTransformService } from '@mm/market-stocks/data-access';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
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
  SymbolSummaryListComponent,
  StockUpgradesDowngradesTableComponent,
} from '@mm/market-stocks/ui';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  GeneralCardComponent,
  GenericChartComponent,
  NameValueListComponent,
  PriceChangeItemsComponent,
  SortByKeyPipe,
} from '@mm/shared/ui';
import { of, switchMap } from 'rxjs';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-details-overview',
  standalone: true,
  imports: [
    CommonModule,
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
    SymbolSummaryListComponent,
    StockEnterpriseChartComponent,
    StockPeersListComponent,
    SortByKeyPipe,
  ],
  template: `
    <div class="grid gap-6" *ngIf="stockDetailsSignal() as stockDetailsSignal">
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div class="md:col-span-2">
          <!-- price & volume -->
          <app-asset-price-chart-interactive
            [imageName]="stockDetailsSignal.quote.symbol"
            [title]="stockDetailsSignal.quote.name"
            [symbol]="stockDetailsSignal.quote.symbol"
            [chartHeightPx]="480"
          />
        </div>

        <!-- summary -->
        <app-general-card class="xl:-mt-6" title="Summary">
          <app-symbol-summary-list [symbolSummary]="stockDetailsSignal" />
        </app-general-card>

        <!-- financial strength -->
        <app-general-card additionalClasses="h-full" title="Financial Strength">
          <app-name-value-list [items]="financialStrengthSignal()" />
        </app-general-card>

        <!-- financial ratio 1 -->
        <app-general-card additionalClasses="h-full" title="Financial Ratio">
          <app-name-value-list [items]="financialRatio1Signal()" />
        </app-general-card>

        <!-- financial ratio 2 -->
        <app-general-card additionalClasses="h-full" title="Financial Ratio">
          <app-name-value-list [items]="financialRatio2Signal()" />
        </app-general-card>

        <!-- earnings -->
        <app-general-card class="md:col-span-2" title="Earnings Chart">
          <app-earnings-estimation-chart
            *ngIf="estimationChartDataSignal() as estimationChartDataSignal"
            [data]="estimationChartDataSignal.earnings"
            [heightPx]="400"
          />
        </app-general-card>

        <!-- recommendation -->
        <app-general-card title="Recommendation Chart">
          <app-stock-recommendation-chart [heightPx]="400" [data]="stockDetailsSignal.recommendationTrends" />
        </app-general-card>

        <!-- financial per share -->
        <app-general-card additionalClasses="h-full" title="Financial Per Share">
          <app-name-value-list [items]="financialPerShareSignal()" />
        </app-general-card>

        <!-- financial operating -->
        <app-general-card additionalClasses="h-full" title="Financial Operating">
          <app-name-value-list [items]="financialOperatingSignal()" />
        </app-general-card>

        <!-- dividends -->
        <app-general-card additionalClasses="h-full" title="Dividends">
          <app-name-value-list *ngIf="financialDividendsSignal().length > 0" [items]="financialDividendsSignal()" />
        </app-general-card>
      </div>

      <!-- revenue est. -->
      <app-general-card title="Revenue Chart">
        <app-revenue-estimation-chart
          *ngIf="estimationChartDataSignal() as estimationChartDataSignal"
          class
          [data]="estimationChartDataSignal.revenue"
          [heightPx]="450"
        ></app-revenue-estimation-chart>
      </app-general-card>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        <!-- rating table -->
        <app-general-card class="sm:max-lg:col-span-2" title="Rating">
          <app-stock-rating-table [data]="companyRatingSignal()"></app-stock-rating-table>
        </app-general-card>

        <!-- profit margin -->
        <app-general-card title="Profit Margin Chart">
          <app-generic-chart
            chartType="column"
            [heightPx]="363"
            [showTooltipHeader]="false"
            [series]="[
              {
                type: 'column',
                colorByPoint: true,
                additionalData: {
                  colorTooltipDefault: true,
                  showPercentageSign: true
                },
                data: stockDetailsSignal.ratio
                  ? [
                      { name: 'Operating Profit', y: stockDetailsSignal.ratio.operatingProfitMarginTTM },
                      { name: 'Gross Profit', y: stockDetailsSignal.ratio.grossProfitMarginTTM },
                      { name: 'Pretax Profit', y: stockDetailsSignal.ratio.pretaxProfitMarginTTM },
                      { name: 'Net Profit', y: stockDetailsSignal.ratio.netProfitMarginTTM },
                      { name: 'Effective Tax Rate', y: stockDetailsSignal.ratio.effectiveTaxRateTTM }
                    ]
                  : []
              }
            ]"
            [showDataLabel]="true"
          >
          </app-generic-chart>
        </app-general-card>

        <!-- return on something -->
        <app-general-card title="Return on Chart">
          <app-generic-chart
            chartType="column"
            [heightPx]="363"
            [showTooltipHeader]="false"
            [series]="[
              {
                type: 'column',
                colorByPoint: true,
                additionalData: {
                  colorTooltipDefault: true,
                  showPercentageSign: true
                },
                data: [
                  { name: 'Equity', y: stockDetailsSignal.ratio?.returnOnEquityTTM ?? 0 },
                  { name: 'Assets', y: stockDetailsSignal.ratio?.returnOnAssetsTTM ?? 0 },
                  { name: 'Tangible Assets', y: stockDetailsSignal.companyKeyMetricsTTM.returnOnTangibleAssetsTTM },
                  { name: 'Capital Employed', y: stockDetailsSignal.ratio?.returnOnCapitalEmployedTTM ?? 0 },
                  { name: 'Invested Capital', y: stockDetailsSignal.companyKeyMetricsTTM.roicTTM }
                ]
              }
            ]"
            [showDataLabel]="true"
          >
          </app-generic-chart>
        </app-general-card>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- upgrades & downgrades -->
        <app-general-card title="Upgrades & Downgrades" class="lg:col-span-2">
          <app-stock-upgrades-downgrades-table
            *ngIf="stockDetailsSignal.upgradesDowngrades.length > 0"
            [data]="stockDetailsSignal.upgradesDowngrades | slice: 0 : 12"
            [currentPrice]="stockDetailsSignal.quote.price"
          ></app-stock-upgrades-downgrades-table>
        </app-general-card>

        <!-- peers -->
        <app-general-card title="Peers" class="hidden lg:block">
          @if (stockPeersSignal(); as stockPeersSignal) {
            <app-stock-peers-list
              *ngIf="stockPeersSignal.length > 0"
              (clickedEmitter)="onShowSummary($event)"
              [peers]="stockPeersSignal | slice: 0 : 12"
            ></app-stock-peers-list>
          }
        </app-general-card>
      </div>

      <div class="grid gap-6 2xl:grid-cols-2">
        <!-- price target -->
        <app-general-card *ngIf="stockDetailsSignal.priceTarget.length > 0" title="Price Target">
          <app-stock-price-target-table
            [data]="stockDetailsSignal.priceTarget | slice: 0 : 10"
            [currentPrice]="stockDetailsSignal.quote.price"
          />
        </app-general-card>

        <!-- enterprise chart -->
        <app-general-card
          title="Enterprise Chart"
          additionalClasses="h-full"
          [ngClass]="{ '2xl:col-span-2': stockDetailsSignal.priceTarget.length === 0 }"
        >
          <app-stock-enterprise-chart
            [heightPx]="520"
            [data]="stockDetailsSignal.enterpriseValue | sortByKey: 'date' : 'asc'"
          />
        </app-general-card>
      </div>

      <!-- <div class="grid gap-6 xl:grid-cols-3">

    <app-general-card title="ESG data" class="xl:col-span-2" additionalClasses="h-full">
      <app-stock-esg-data-table
        [data]="stockDetailsSignal.esgDataQuarterlyArray | slice: 0 : 8"
      ></app-stock-esg-data-table>
    </app-general-card>


    <app-general-card title="ESG data" class="hidden xl:block">
      <div *ngFor="let data of stockDetailsSignal.esgDataRatingYearlyArray" class="g-item-wrapper">
        <div>{{ data.year }}</div>
        <div class="space-x-2">
          <span>{{ data.industryRank }}</span>
          <span class="text-wt-gray-dark"> ({{ data.ESGRiskRating }})</span>
        </div>
      </div>
    </app-general-card>
  </div> -->
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsOverviewComponent extends PageStockDetailsBase {
  private stockTransformService = inject(StockTransformService);
  private dialog = inject(MatDialog);

  stockPeersSignal = toSignal(
    this.stockDetails$.pipe(
      switchMap((details) => {
        if (!details.sectorPeers || details.sectorPeers.peersList.length === 0) {
          return of([]);
        }
        return this.marketApiService.getSymbolSummaries(details.sectorPeers.peersList);
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

  onShowSummary(summary: SymbolSummary) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
