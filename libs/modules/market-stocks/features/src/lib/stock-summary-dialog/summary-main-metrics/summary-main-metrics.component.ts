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
        [useShadow]="false"
        [titleCenter]="true"
        titleScale="large"
        title="Price"
        additionalClasses="h-full"
        cardColor="bg-wt-gray-light-strong"
        class="max-sm:w-full min-w-[275px]"
      >
        <div class="flex items-center justify-center gap-3">
          <span>{{ stockSummary().quote.price | currency }}</span>
          <span
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: stockSummary().quote.change,
              changePercentage: stockSummary().quote.changesPercentage
            }"
          ></span>
        </div>
      </app-general-card>

      <!-- market cap -->
      <app-general-card
        [useShadow]="false"
        [titleCenter]="true"
        titleScale="large"
        title="Market Cap."
        additionalClasses="h-full"
        cardColor="bg-wt-gray-light-strong"
        class="hidden sm:block min-w-[150px]"
      >
        <div class="text-center">{{ stockSummary().profile?.mktCap | largeNumberFormatter }}</div>
      </app-general-card>

      <!-- volume -->
      <!-- <app-general-card [titleCenter]="true" title="Volume" additionalClasses="h-full"
    cardColor="bg-wt-gray-light-strong" class="hidden lg:block">
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
        [useShadow]="false"
        [titleCenter]="true"
        titleScale="large"
        additionalClasses="h-full"
        cardColor="bg-wt-gray-light-strong"
        title="PE"
        class="hidden md:block min-w-[100px]"
      >
        <div class="text-center">{{ stockSummary().quote.pe | number: '1.2-2' }}</div>
      </app-general-card>

      <!-- EPS -->
      <app-general-card
        [useShadow]="false"
        [titleCenter]="true"
        titleScale="large"
        additionalClasses="h-full"
        cardColor="bg-wt-gray-light-strong"
        title="EPS"
        class="hidden lg:block min-w-[100px]"
      >
        <div class="text-center">{{ stockSummary().quote.eps ?? 'N/A' }}</div>
      </app-general-card>

      <!-- Sector -->
      <app-general-card
        [useShadow]="false"
        [titleCenter]="true"
        titleScale="large"
        title="Sector"
        additionalClasses="h-full"
        cardColor="bg-wt-gray-light-strong"
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
