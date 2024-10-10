import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MarketApiService, StocksApiService } from '@mm/api-client';
import {
  PageStockDetailsFinancialsComponent,
  PageStockDetailsNewsComponent,
  PageStockDetailsOverviewComponent,
  PageStockDetailsRatiosComponent,
  PageStockDetailsTradesComponent,
} from '@mm/page-builder';
import { LabelValue, ROUTES_STOCK_DETAILS } from '@mm/shared/data-access';
import { DialogServiceModule } from '@mm/shared/dialog-manager';
import { TabSelectControlComponent } from '@mm/shared/ui';
import { catchError, filter, forkJoin, map, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-stock-details',
  standalone: true,
  imports: [
    RouterModule,
    TabSelectControlComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    DialogServiceModule,
    MatProgressSpinnerModule,
    PageStockDetailsOverviewComponent,
    PageStockDetailsNewsComponent,
    PageStockDetailsTradesComponent,
    PageStockDetailsFinancialsComponent,
    PageStockDetailsRatiosComponent,
  ],
  template: `
    <section class="g-screen-size-default">
      @if (symbolDetails(); as symbolDetails) {
        @if (symbolDetails.action === 'loading') {
          <div class="grid min-h-screen min-w-full place-content-center pb-[15%]">
            <mat-spinner />
          </div>
        } @else if (symbolDetails.action === 'loaded') {
          <div class="mb-6 flex justify-between">
            <div>
              <button type="button" mat-stroked-button class="mt-2 min-w-[120px]" (click)="onHomeClick()">
                <mat-icon>home</mat-icon>
                Home
              </button>
            </div>

            <!-- main navigation -->
            <app-tab-select-control
              [formControl]="routesStockDetailsControl"
              [displayOptions]="routesStockDetails"
              screenLayoutSplit="LAYOUT_XL"
            />
          </div>

          @switch (routesStockDetailsControl.value) {
            @case (ROUTES_STOCK_DETAILS.OVERVIEW) {
              <app-page-details-overview [stockDetailsSignal]="symbolDetails.data.stockDetails" />
            }
            @case (ROUTES_STOCK_DETAILS.FINANCIALS) {
              <app-page-stock-details-financials [stockDetailsSignal]="symbolDetails.data.stockDetails" />
            }

            @case (ROUTES_STOCK_DETAILS.RATIOS) {
              <app-page-stock-details-ratios [stockDetailsSignal]="symbolDetails.data.stockDetails" />
            }

            @case (ROUTES_STOCK_DETAILS.TRADES) {
              <app-page-stock-details-trades [stockDetailsSignal]="symbolDetails.data.stockDetails" />
            }

            @case (ROUTES_STOCK_DETAILS.NEWS) {
              <app-page-stock-details-news [stockDetailsSignal]="symbolDetails.data.stockDetails" />
            }
          }
        }
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      @apply mt-6 block;
    }
  `,
})
export class StockDetailsComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly stocksApiService = inject(StocksApiService);
  private readonly marketApiService = inject(MarketApiService);
  readonly routesStockDetailsControl = new FormControl<string>(ROUTES_STOCK_DETAILS.OVERVIEW);
  readonly routesStockDetails: LabelValue<string>[] = [
    { label: 'Overview', value: ROUTES_STOCK_DETAILS.OVERVIEW },
    { label: 'Financials', value: ROUTES_STOCK_DETAILS.FINANCIALS },
    { label: 'Ratios', value: ROUTES_STOCK_DETAILS.RATIOS },
    { label: 'News', value: ROUTES_STOCK_DETAILS.NEWS },
    //{ label: 'Holders', value: ROUTES_STOCK_DETAILS.HOLDERS },
    { label: 'Trades', value: ROUTES_STOCK_DETAILS.TRADES },
  ];

  readonly ROUTES_STOCK_DETAILS = ROUTES_STOCK_DETAILS;

  readonly symbolDetails = toSignal(
    this.route.params.pipe(
      map((params) => params['symbol']),
      filter((symbol) => !!symbol),
      switchMap((symbol) =>
        forkJoin([
          this.stocksApiService.getStockDetails(symbol),
          this.stocksApiService.getStockOwnershipInstitutional(symbol),
          this.stocksApiService.getStockHistoricalMetrics(symbol),
          this.stocksApiService.getStockInsiderTrades(symbol),
          this.marketApiService.getNews('stocks', symbol),
        ]).pipe(
          map((details) => ({
            action: 'loaded' as const,
            data: {
              stockDetails: details[0],
              stockOwnershipInstitutional: details[1],
              stockHistoricalMetrics: details[2],
              stockInsiderTrades: details[3],
              news: details[4],
            },
          })),
          catchError(() => [{ action: 'error' as const }]),
          startWith({ action: 'loading' as const }),
        ),
      ),
    ),
    { initialValue: { action: 'loading' as const } },
  );

  readonly symbolDetailsChange = effect(() => {
    const symbolDetails = this.symbolDetails();
    console.log('symbolDetails', symbolDetails);

    untracked(() => {
      if (symbolDetails.action === 'error') {
        this.router.navigate(['/']);
      }
    });
  });

  onHomeClick(): void {
    this.router.navigate(['']);
  }
}
