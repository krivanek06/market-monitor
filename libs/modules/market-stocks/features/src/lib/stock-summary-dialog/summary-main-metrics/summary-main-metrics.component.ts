import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { SymbolSummary } from '@mm/api-types';
import { GeneralCardComponent, LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-summary-main-metrics',
  standalone: true,
  imports: [CommonModule, GeneralCardComponent, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  template: `
    <div class="flex justify-around">
      <!-- price -->
      <app-general-card
        [titleCenter]="true"
        title="Price"
        additionalClasses="h-full"
        class="min-w-[275px] max-sm:w-full"
      >
        <div class="flex items-center justify-center gap-3">
          <span>{{ stockSummary().quote.price | currency }}</span>
          <span
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: stockSummary().quote.change,
              changePercentage: stockSummary().quote.changesPercentage,
            }"
          ></span>
        </div>
      </app-general-card>

      <!-- market cap -->
      <app-general-card
        [titleCenter]="true"
        title="Market Cap."
        additionalClasses="h-full"
        class="hidden min-w-[150px] sm:block"
      >
        <div class="text-center">{{ stockSummary().profile?.mktCap | largeNumberFormatter }}</div>
      </app-general-card>

      <!-- volume -->
      <!-- <app-general-card [titleCenter]="true" title="Volume" additionalClasses="h-full"
  class="hidden lg:block">
    <div>
      <span>{{ stockSummary().quote.volume | largeNumberFormatter }}</span>
      <span
        appPercentageIncrease
        [currentValues]="{
        value: stockSummary().quote.volume,
        valueToCompare: stockSummary().quote.avgVolume,
    }"
      ></span>
    </div>
  </app-general-card> -->

      <!-- PE -->
      <app-general-card
        [titleCenter]="true"
        additionalClasses="h-full"
        title="PE"
        class="hidden min-w-[100px] md:block"
      >
        <div class="text-center">
          {{ stockSummary().quote.pe ? (stockSummary().quote.pe | number: '1.2-2') : 'N/A' }}
        </div>
      </app-general-card>

      <!-- EPS -->
      <app-general-card
        [titleCenter]="true"
        additionalClasses="h-full"
        title="EPS"
        class="hidden min-w-[100px] lg:block"
      >
        <div class="text-center">
          {{ stockSummary().quote.eps ? (stockSummary().quote.eps | number: '1.2-2') : 'N/A' }}
        </div>
      </app-general-card>

      <!-- Sector -->
      <app-general-card
        [titleCenter]="true"
        title="Sector"
        additionalClasses="h-full"
        class="hidden text-center xl:block"
      >
        <div>{{ stockSummary().profile?.sector || 'N/A' }}</div>
      </app-general-card>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SummaryMainMetricsComponent {
  stockSummary = input.required<SymbolSummary>();
}
