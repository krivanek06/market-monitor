import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import {
  CompanyRatingTable,
  StockInsiderTradesComponent,
  StockRatingTableComponent,
  StockRecommendationComponent,
  StockTransformService,
} from '@market-monitor/modules/market-stocks';
import { GeneralCardComponent, GenericChartComponent } from '@market-monitor/shared-components';
import { DialogServiceModule, DialogServiceUtil } from '@market-monitor/shared-utils-client';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-stock-details',
  standalone: true,
  imports: [
    CommonModule,
    DialogServiceModule,
    GenericChartComponent,
    StockRatingTableComponent,
    StockRecommendationComponent,
    StockInsiderTradesComponent,
    GeneralCardComponent,
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

  stockDetailsSignal = signal<StockDetails | null>(null);
  companyRatingSignal = signal<CompanyRatingTable | null>(null);
  loadingSignal = signal(true);

  constructor() {
    this.route.params
      .pipe(
        map((params) => params['symbol'] as string | undefined),
        tap((symbol) => {
          if (!symbol) {
            this.router.navigate(['/']);
          }
        }),
        filter((symbol): symbol is string => !!symbol),
        tap(() => this.loadingSignal.set(true)),
        switchMap((symbol) =>
          this.stocksApiService.getStockDetails(symbol).pipe(
            tap((data) => {
              this.stockDetailsSignal.set(data);
              this.companyRatingSignal.set(this.stockTransformService.createCompanyRatingTable(data));
              this.loadingSignal.set(false);
            }),
            catchError((err) => {
              this.dialogServiceUtil.showNotificationBar(
                `An error happened getting data for symbol: ${symbol}`,
                'error'
              );
              this.router.navigate(['/']);
              return of(undefined);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((x) => console.log('details', x));
  }
}
