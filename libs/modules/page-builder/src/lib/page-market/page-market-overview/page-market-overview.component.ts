import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@mm/api-client';
import { INDEXES_DEFAULT, INDEXES_DEFAULT_SYMBOLS, SYMBOL_SP500, SymbolQuote } from '@mm/api-types';
import { AssetPriceChartInteractiveComponent, QuoteSearchBasicComponent } from '@mm/market-general/features';
import {
  GeneralCardComponent,
  GenericChartComponent,
  PercentageIncreaseDirective,
  RangeDirective,
  SectionTitleComponent,
} from '@mm/shared/ui';
import { map } from 'rxjs';
import { economicData, treasuryData } from './page-market-overview-model';

@Component({
  selector: 'app-page-market-overview',
  standalone: true,
  imports: [
    DecimalPipe,
    AssetPriceChartInteractiveComponent,
    GenericChartComponent,
    QuoteSearchBasicComponent,
    ReactiveFormsModule,
    MatButtonModule,
    GeneralCardComponent,
    PercentageIncreaseDirective,
    RangeDirective,
    SectionTitleComponent,
    RangeDirective,
  ],
  template: `
    <div class="mb-6 flex gap-3 p-2 max-md:overflow-x-scroll md:grid md:grid-cols-2 xl:flex xl:justify-around">
      <!-- top index quotes -->
      @if (marketTopIndexQuotes(); as marketTopIndexQuotes) {
        @for (index of marketTopIndexQuotes; track index.name) {
          <app-general-card [title]="index.name" additionalClasses="min-w-max px-6 py-3" titleScale="large">
            <div class="flex items-center justify-center gap-3 text-base">
              <span>{{ index.summary.quote.price | number: '1.2-2' }}</span>
              <span
                appPercentageIncrease
                [useCurrencySign]="false"
                [changeValues]="{
                  change: index.summary.quote.change,
                  changePercentage: index.summary.quote.changesPercentage,
                }"
              ></span>
            </div>
          </app-general-card>
        }
      } @else {
        <!-- skeleton -->
        <div *ngRange="4" class="g-skeleton h-[115px] w-full px-6 py-3 lg:min-w-[320px]"></div>
      }
    </div>

    <!-- search index quotes -->
    <div class="mb-2 md:mb-6">
      <app-quote-search-basic
        [formControl]="selectedIndexSymbolQuoteControl"
        class="w-full md:w-[520px]"
        type="index"
      />
    </div>

    <!-- price chart -->
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

    <!-- treasury rates -->
    <div class="mx-auto w-full max-sm:pr-3 lg:w-11/12">
      <app-section-title title="Treasury Rates" class="mb-3" />
      <div class="mb-10 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        @if (marketTreasuryData(); as marketTreasuryData) {
          @for (item of treasuryData; track item.key) {
            <app-generic-chart
              [isCategoryDates]="true"
              [chartTitle]="item.chartTitle"
              [heightPx]="300"
              [applyFancyColor]="2"
              [series]="[{ type: 'line', data: marketTreasuryData[item.key], name: item.chartTitle }]"
              [categories]="marketTreasuryData.date"
            />
          }
        } @else {
          <div *ngRange="6" class="g-skeleton h-[300px]"></div>
        }
      </div>
    </div>

    <!-- other economic data -->
    <div class="mx-auto w-full max-sm:pr-3 lg:w-11/12">
      <app-section-title title="Economic Data" class="mb-3" />
      <div class="mb-10 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        @if (marketEconomicData(); as marketEconomicData) {
          @for (item of economicData; track item.key) {
            <app-generic-chart
              [isCategoryDates]="true"
              [chartTitle]="item.chartTitle"
              [heightPx]="300"
              [applyFancyColor]="item.fancyColor"
              [series]="[{ type: 'line', data: marketEconomicData[item.key].value, name: item.chartTitle }]"
              [categories]="marketEconomicData[item.key].date"
            />
          }
        } @else {
          <div *ngRange="12" class="g-skeleton h-[300px]"></div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PageMarketOverviewComponent {
  private readonly marketApiService = inject(MarketApiService);

  readonly selectedIndexSymbolQuoteControl = new FormControl<SymbolQuote | null>(null);

  readonly marketTreasuryData = toSignal(this.marketApiService.getMarketTreasuryData());
  readonly marketEconomicData = toSignal(this.marketApiService.getMarketEconomicDataAll());

  readonly SYMBOL_SP500 = SYMBOL_SP500;
  readonly economicData = economicData;
  readonly treasuryData = treasuryData;

  readonly marketTopIndexQuotes = toSignal(
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
