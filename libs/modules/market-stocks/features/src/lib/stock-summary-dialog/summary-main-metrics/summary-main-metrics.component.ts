import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SymbolSummary } from '@mm/api-types';
import { LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-summary-main-metrics',
  standalone: true,
  imports: [DecimalPipe, CurrencyPipe, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  template: `
    <div class="flex flex-col justify-around sm:flex-row">
      <!-- price -->
      <div class="border-wt-border min-w-[100px] rounded-lg border px-6 py-4 text-center">
        <div class="text-wt-primary text-lg">Price</div>
        <div class="flex items-center justify-center gap-3">
          <span class="text-wt-gray-dark">{{ stockSummary().quote.price | currency }}</span>
          <span
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: stockSummary().quote.change,
              changePercentage: stockSummary().quote.changesPercentage,
            }"
          ></span>
        </div>
      </div>

      <!-- market cap -->
      <div class="border-wt-border min-w-[100px] rounded-lg border px-6 py-4 text-center max-sm:hidden">
        <div class="text-wt-primary text-lg">Market Cap.</div>
        <div class="text-wt-gray-dark">{{ stockSummary().profile?.mktCap | largeNumberFormatter }}</div>
      </div>

      <!-- PE -->
      <div class="border-wt-border min-w-[100px] rounded-lg border px-6 py-4 text-center max-sm:hidden">
        <div class="text-wt-primary text-lg">PE</div>
        <div class="text-wt-gray-dark">
          {{ stockSummary().quote.pe ? (stockSummary().quote.pe | number: '1.2-2') : 'N/A' }}
        </div>
      </div>

      <!-- EPS -->
      <div class="border-wt-border min-w-[100px] rounded-lg border px-6 py-4 text-center max-md:hidden">
        <div class="text-wt-primary text-lg">EPS</div>
        <div class="text-wt-gray-dark">
          {{ stockSummary().quote.eps ? (stockSummary().quote.eps | number: '1.2-2') : 'N/A' }}
        </div>
      </div>

      <!-- Sector -->
      <div class="border-wt-border min-w-[100px] rounded-lg border px-6 py-4 text-center max-lg:hidden">
        <div class="text-wt-primary text-lg">Sector</div>
        <div class="text-wt-gray-dark">{{ stockSummary().profile?.sector || 'N/A' }}</div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SummaryMainMetricsComponent {
  readonly stockSummary = input.required<SymbolSummary>();
}
