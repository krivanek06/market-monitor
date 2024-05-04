import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@mm/api-client';
import { INDEXES_DEFAULT, INDEXES_DEFAULT_SYMBOLS, SYMBOL_SP500, SymbolQuote } from '@mm/api-types';
import { AssetPriceChartInteractiveComponent, QuoteSearchBasicComponent } from '@mm/market-general/features';
import {
  FlattenArrayPipe,
  GeneralCardComponent,
  GenericChartComponent,
  MultiplyDtaPipe,
  PercentageIncreaseDirective,
  RangeDirective,
  SortReversePipe,
} from '@mm/shared/ui';
import { map } from 'rxjs';
import { PageMarketOverviewSkeletonComponent } from './page-market-overview-skeleton.component';

@Component({
  selector: 'app-page-market-overview',
  standalone: true,
  imports: [
    CommonModule,
    AssetPriceChartInteractiveComponent,
    GenericChartComponent,
    QuoteSearchBasicComponent,
    ReactiveFormsModule,
    MatButtonModule,
    GeneralCardComponent,
    PercentageIncreaseDirective,
    PageMarketOverviewSkeletonComponent,
    RangeDirective,
    FlattenArrayPipe,
    SortReversePipe,
    MultiplyDtaPipe,
  ],
  template: `
    <div class="flex gap-3 p-2 mb-6 xl:justify-around md:grid-cols-2 max-md:overflow-x-scroll md:grid xl:flex">
      <ng-container *ngIf="marketTopIndexQuotesSignal() as marketTopIndexQuotesSignal; else topIndexSkeleton">
        <app-general-card
          *ngFor="let index of marketTopIndexQuotesSignal"
          [title]="index.name"
          [titleCenter]="true"
          additionalClasses="min-w-max px-6 py-3"
          titleScale="large"
        >
          <div class="flex items-center justify-center gap-3 text-base">
            <span>{{ index.summary.quote.price | number: '1.2-2' }}</span>
            <span
              appPercentageIncrease
              [useCurrencySign]="false"
              [changeValues]="{
                change: index.summary.quote.change,
                changePercentage: index.summary.quote.changesPercentage
              }"
            ></span>
          </div>
        </app-general-card>
      </ng-container>

      <!-- skeleton -->
      <ng-template #topIndexSkeleton>
        <div class="flex gap-3 p-2 mb-6 xl:justify-around md:grid-cols-2 max-md:overflow-x-scroll md:grid xl:flex">
          <div *ngRange="4" class="w-full lg:min-w-[320px] px-6 py-3 h-[115px] g-skeleton"></div>
        </div>
      </ng-template>
    </div>

    <div class="flex max-sm:w-full">
      <app-quote-search-basic
        [formControl]="selectedIndexSymbolQuoteControl"
        class="min-w-[500px] max-sm:w-full"
        type="index"
      />
    </div>

    <div class="mb-10">
      <app-asset-price-chart-interactive
        priceName="Value"
        [priceShowSign]="false"
        [symbol]="selectedIndexSymbolQuoteControl.value?.symbol ?? SYMBOL_SP500"
        [chartHeightPx]="400"
        [displayVolume]="false"
        [title]="selectedIndexSymbolQuoteControl.value?.name ?? 'S&P 500'"
      />
    </div>

    <!-- <div class="w-full mx-auto max-sm:pr-3 lg:w-11/12">
        <h2>SP500 stats</h2>
        <div class="grid grid-cols-1 mb-10 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          <app-generic-chart
            *ngIf="marketOverviewSignalValues.sp500.peRatio | sortReverse as data"
            [isCategoryDates]="true"
            chartTitle="PE Ratio"
            [heightPx]="300"
            [applyFancyColor]="2"
            [series]="[{ type: 'line', data: data | flattenArray: 1, name: 'PE Ratio' }]"
            [categories]="data | flattenArray: 0"
          />

          <app-generic-chart
            *ngIf="marketOverviewSignalValues.sp500.shillerPeRatio | sortReverse as data"
            [isCategoryDates]="true"
            chartTitle="Shiller PE Ratio"
            [heightPx]="300"
            [applyFancyColor]="2"
            [series]="[{ type: 'line', data: data | flattenArray: 1, name: 'Shiller PE Ratio' }]"
            [categories]="data | flattenArray: 0"
          />

          <app-generic-chart
            *ngIf="marketOverviewSignalValues.sp500.priceToBook | sortReverse as data"
            [isCategoryDates]="true"
            chartTitle="Price To Book"
            [heightPx]="300"
            [applyFancyColor]="2"
            [series]="[{ type: 'line', data: data | flattenArray: 1, name: 'Price To Book' }]"
            [categories]="data | flattenArray: 0"
          />

          <app-generic-chart
            *ngIf="marketOverviewSignalValues.sp500.priceToSales | sortReverse as data"
            [isCategoryDates]="true"
            chartTitle="Price To Sales"
            [heightPx]="300"
            [applyFancyColor]="2"
            [series]="[{ type: 'line', data: data | flattenArray: 1, name: 'Price To Sales' }]"
            [categories]="data | flattenArray: 0"
          />

          <app-generic-chart
            *ngIf="marketOverviewSignalValues.sp500.earningsYield | sortReverse as data"
            [isCategoryDates]="true"
            chartTitle="Earning Yield"
            [heightPx]="300"
            [applyFancyColor]="2"
            [series]="[{ type: 'line', data: data | flattenArray: 1, name: 'Earning Yield' }]"
            [categories]="data | flattenArray: 0"
          />

          <app-generic-chart
            *ngIf="marketOverviewSignalValues.sp500.dividendYield | sortReverse as data"
            [isCategoryDates]="true"
            chartTitle="Dividend Yield"
            [heightPx]="300"
            [applyFancyColor]="2"
            [series]="[{ type: 'line', data: data | flattenArray: 1, name: 'Dividend Yield' }]"
            [categories]="data | flattenArray: 0"
          />
        </div>
       -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PageMarketOverviewComponent {
  marketApiService = inject(MarketApiService);

  selectedIndexSymbolQuoteControl = new FormControl<SymbolQuote | null>(null);

  SYMBOL_SP500 = SYMBOL_SP500;

  marketTopIndexQuotesSignal = toSignal(
    this.marketApiService.getSymbolSummaries(INDEXES_DEFAULT_SYMBOLS).pipe(
      map((quotes) =>
        quotes.map((summary, index) => ({
          name: INDEXES_DEFAULT[index].name,
          summary,
        })),
      ),
    ),
  );
}
