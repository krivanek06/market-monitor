import { NgClass, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { SymbolSummary } from '@mm/api-types';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { StockTransformService } from '@mm/market-stocks/data-access';
import { SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import {
  EarningsEstimationChartComponent,
  RevenueEstimationChartComponent,
  StockEnterpriseChartComponent,
  StockPeersListComponent,
  StockPriceTargetTableComponent,
  StockRatingTableComponent,
  StockRecommendationChartComponent,
  StockUpgradesDowngradesTableComponent,
  SymbolSummaryListComponent,
} from '@mm/market-stocks/ui';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { GeneralCardComponent, GenericChartComponent, SortByKeyPipe, WordsUpPipe } from '@mm/shared/ui';
import { of, switchMap } from 'rxjs';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-details-overview',
  standalone: true,
  imports: [
    GenericChartComponent,
    GeneralCardComponent,
    StockRatingTableComponent,
    StockRecommendationChartComponent,
    EarningsEstimationChartComponent,
    RevenueEstimationChartComponent,
    StockUpgradesDowngradesTableComponent,
    StockPriceTargetTableComponent,
    AssetPriceChartInteractiveComponent,
    SymbolSummaryListComponent,
    StockEnterpriseChartComponent,
    StockPeersListComponent,
    SortByKeyPipe,
    WordsUpPipe,
    NgClass,
    SlicePipe,
  ],
  template: `
    <div class="grid gap-6">
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div class="md:col-span-2">
          <!-- price & volume -->
          <app-asset-price-chart-interactive
            [imageName]="stockDetailsSignal().quote.symbol"
            [title]="stockDetailsSignal().quote.name"
            [symbol]="stockDetailsSignal().quote.symbol"
            [chartHeightPx]="450"
          />
        </div>

        <!-- summary -->
        <app-general-card class="xl:-mt-6" title="Summary">
          <app-symbol-summary-list [symbolSummary]="stockDetailsSignal()" />
        </app-general-card>

        <!-- financial strength -->
        <app-general-card additionalClasses="h-full" title="Financial Strength">
          @for (item of financialStrengthSignal(); track item.name) {
            <div class="g-item-wrapper">
              <span>{{ item.name | wordsUp }}</span>
              <span>{{ item.value === null ? 'N/A' : item.value }}</span>
            </div>
          }
        </app-general-card>

        <!-- financial ratio 1 -->
        <app-general-card additionalClasses="h-full" title="Financial Ratio">
          @for (item of financialRatio1Signal(); track item.name) {
            <div class="g-item-wrapper">
              <span>{{ item.name | wordsUp }}</span>
              <span>{{ item.value === null ? 'N/A' : item.value }}</span>
            </div>
          }
        </app-general-card>

        <!-- financial ratio 2 -->
        <app-general-card additionalClasses="h-full" title="Financial Ratio">
          @for (item of financialRatio2Signal(); track item.name) {
            <div class="g-item-wrapper">
              <span>{{ item.name | wordsUp }}</span>
              <span>{{ item.value === null ? 'N/A' : item.value }}</span>
            </div>
          }
        </app-general-card>

        <!-- earnings -->
        <app-general-card class="md:col-span-2" title="Earnings Chart">
          @if (estimationChartDataSignal(); as estimationChartDataSignal) {
            <app-earnings-estimation-chart [data]="estimationChartDataSignal.earnings" [heightPx]="400" />
          }
        </app-general-card>

        <!-- recommendation -->
        <app-general-card title="Recommendation Chart">
          <app-stock-recommendation-chart [heightPx]="400" [data]="stockDetailsSignal().recommendationTrends" />
        </app-general-card>

        <!-- financial per share -->
        <app-general-card additionalClasses="h-full" title="Financial Per Share">
          @for (item of financialPerShareSignal(); track item.name) {
            <div class="g-item-wrapper">
              <span>{{ item.name | wordsUp }}</span>
              <span>{{ item.value === null ? 'N/A' : item.value }}</span>
            </div>
          }
        </app-general-card>

        <!-- financial operating -->
        <app-general-card additionalClasses="h-full" title="Financial Operating">
          @for (item of financialOperatingSignal(); track item.name) {
            <div class="g-item-wrapper">
              <span>{{ item.name | wordsUp }}</span>
              <span>{{ item.value === null ? 'N/A' : item.value }}</span>
            </div>
          }
        </app-general-card>

        <!-- dividends -->
        <app-general-card additionalClasses="h-full" title="Dividends">
          @if (financialDividendsSignal().length > 0) {
            @for (item of financialDividendsSignal(); track item.name) {
              <div class="g-item-wrapper">
                <span>{{ item.name | wordsUp }}</span>
                <span>{{ item.value === null ? 'N/A' : item.value }}</span>
              </div>
            }
          }
        </app-general-card>
      </div>

      <!-- revenue est. -->
      <app-general-card title="Revenue Chart">
        @if (estimationChartDataSignal(); as estimationChartDataSignal) {
          <app-revenue-estimation-chart [data]="estimationChartDataSignal.revenue" [heightPx]="450" />
        }
      </app-general-card>

      <div class="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  showPercentageSign: true,
                },
                data: stockDetailsSignal().ratio
                  ? [
                      { name: 'Operating Profit', y: stockDetailsSignal().ratio?.operatingProfitMarginTTM },
                      { name: 'Gross Profit', y: stockDetailsSignal().ratio?.grossProfitMarginTTM },
                      { name: 'Pretax Profit', y: stockDetailsSignal().ratio?.pretaxProfitMarginTTM },
                      { name: 'Net Profit', y: stockDetailsSignal().ratio?.netProfitMarginTTM },
                      { name: 'Effective Tax Rate', y: stockDetailsSignal().ratio?.effectiveTaxRateTTM },
                    ]
                  : [],
              },
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
                  showPercentageSign: true,
                },
                data: [
                  { name: 'Equity', y: stockDetailsSignal().ratio?.returnOnEquityTTM ?? 0 },
                  { name: 'Assets', y: stockDetailsSignal().ratio?.returnOnAssetsTTM ?? 0 },
                  { name: 'Tangible Assets', y: stockDetailsSignal().companyKeyMetricsTTM.returnOnTangibleAssetsTTM },
                  { name: 'Capital Employed', y: stockDetailsSignal().ratio?.returnOnCapitalEmployedTTM ?? 0 },
                  { name: 'Invested Capital', y: stockDetailsSignal().companyKeyMetricsTTM.roicTTM },
                ],
              },
            ]"
            [showDataLabel]="true"
          >
          </app-generic-chart>
        </app-general-card>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- upgrades & downgrades -->
        <app-general-card title="Upgrades & Downgrades" class="lg:col-span-2">
          @if (stockDetailsSignal().upgradesDowngrades.length > 0) {
            <app-stock-upgrades-downgrades-table
              [data]="stockDetailsSignal().upgradesDowngrades | slice: 0 : 12"
              [currentPrice]="stockDetailsSignal().quote.price"
            />
          }
        </app-general-card>

        <!-- peers -->
        <app-general-card title="Peers" class="hidden lg:block">
          @if (stockPeersSignal().length > 0) {
            <app-stock-peers-list
              (clickedEmitter)="onShowSummary($event)"
              [peers]="stockPeersSignal() | slice: 0 : 12"
            />
          }
        </app-general-card>
      </div>

      <div class="grid gap-6" [ngClass]="{ '2xl:grid-cols-2': stockDetailsSignal().priceTarget.length > 0 }">
        <!-- price target -->
        @if (stockDetailsSignal().priceTarget.length > 0) {
          <app-general-card title="Price Target">
            <app-stock-price-target-table
              [data]="stockDetailsSignal().priceTarget | slice: 0 : 9"
              [currentPrice]="stockDetailsSignal().quote.price"
            />
          </app-general-card>
        }

        <!-- enterprise chart -->
        <app-general-card title="Enterprise Chart" additionalClasses="h-full">
          <app-stock-enterprise-chart
            [heightPx]="520"
            [data]="stockDetailsSignal().enterpriseValue | sortByKey: 'date' : 'asc'"
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
  private readonly stockTransformService = inject(StockTransformService);
  private readonly dialog = inject(MatDialog);

  readonly stockPeersSignal = toSignal(
    toObservable(this.stockDetailsSignal).pipe(
      switchMap((details) => {
        if (!details.sectorPeers || details.sectorPeers.peersList.length === 0) {
          return of([]);
        }
        return this.marketApiService.getSymbolSummaries(details.sectorPeers.peersList);
      }),
    ),
    { initialValue: [] },
  );

  readonly companyRatingSignal = computed(() =>
    this.stockTransformService.createCompanyRatingTable(this.stockDetailsSignal()),
  );
  readonly estimationChartDataSignal = computed(() =>
    this.stockTransformService.createEstimationData(this.stockDetailsSignal()),
  );
  readonly financialStrengthSignal = computed(() =>
    this.stockTransformService.createFinancialStrength(this.stockDetailsSignal()),
  );
  readonly financialRatio1Signal = computed(() =>
    this.stockTransformService.createFinancialRatio1(this.stockDetailsSignal()),
  );
  readonly financialRatio2Signal = computed(() =>
    this.stockTransformService.createFinancialRatio2(this.stockDetailsSignal()),
  );
  readonly financialPerShareSignal = computed(() =>
    this.stockTransformService.createFinancialPerShare(this.stockDetailsSignal()),
  );
  readonly financialOperatingSignal = computed(() =>
    this.stockTransformService.createFinancialOperatingData(this.stockDetailsSignal()),
  );
  readonly financialDividendsSignal = computed(() =>
    this.stockTransformService.createFinancialDividends(this.stockDetailsSignal()),
  );

  onShowSummary(summary: SymbolSummary) {
    this.dialog.open(SymbolSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
