import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import {
  EarningsEstimationChartComponent,
  RevenueEstimationChartComponent,
} from '@market-monitor/modules/market-earnings';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general';
import {
  StockEsgDataTableComponent,
  StockInsiderTradesComponent,
  StockKeyExecutivesTableComponent,
  StockPriceTargetTableComponent,
  StockRatingTableComponent,
  StockRecommendationComponent,
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
import { DialogServiceModule, DialogServiceUtil } from '@market-monitor/shared-utils-client';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-stock-details',
  standalone: true,
  imports: [
    CommonModule,
    DialogServiceModule,
    GenericChartComponent,
    GeneralCardComponent,
    StockRatingTableComponent,
    StockRecommendationComponent,
    StockInsiderTradesComponent,
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
  ],
  templateUrl: './stock-details.component.html',
  styleUrls: ['./stock-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  stocksApiService = inject(StocksApiService);
  stockTransformService = inject(StockTransformService);
  dialogServiceUtil = inject(DialogServiceUtil);

  stockDetailsSignal = toSignal(
    this.route.params.pipe(
      map((params) => params['symbol'] as string | undefined),
      tap((symbol) => {
        if (!symbol) {
          this.router.navigate(['/']);
        }
      }),
      filter((symbol): symbol is string => !!symbol),
      switchMap((symbol) =>
        this.stocksApiService.getStockDetails(symbol).pipe(
          catchError((err) => {
            this.dialogServiceUtil.showNotificationBar(`An error happened getting data for symbol: ${symbol}`, 'error');
            this.router.navigate(['/']);
            return of(undefined);
          })
        )
      )
    )
  );

  companyRatingSignal = computed(() => this.stockTransformService.createCompanyRatingTable(this.stockDetailsSignal()));
  estimationChartDataSignal = computed(
    computed(() => this.stockTransformService.createEstimationData(this.stockDetailsSignal()))
  );
  financialStrengthSignal = computed(() =>
    this.stockTransformService.createFinancialStrength(this.stockDetailsSignal())
  );
  financialRatio1Signal = computed(() => this.stockTransformService.createFinancialRatio1(this.stockDetailsSignal()));
  financialRatio2Signal = computed(() => this.stockTransformService.createFinancialRatio2(this.stockDetailsSignal()));
  financialPerShareSignal = computed(() =>
    this.stockTransformService.createFinancialPerShare(this.stockDetailsSignal())
  );
  financialOperatingSignal = computed(() =>
    this.stockTransformService.createFinancialOperatingData(this.stockDetailsSignal())
  );

  constructor() {}
}
