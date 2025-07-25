import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { SymbolSummary } from '@mm/api-types';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  PriceChangeItemSelectorPipe,
} from '@mm/shared/ui';

@Component({
  selector: 'app-symbol-summary-list',
  standalone: true,
  imports: [
    CommonModule,
    LargeNumberFormatterPipe,
    PercentageIncreaseDirective,
    MatChipsModule,
    PriceChangeItemSelectorPipe,
    DefaultImgDirective,
  ],
  template: `
    <div class="flex flex-wrap justify-between p-3">
      <ng-container *ngTemplateOutlet="priceChange; context: { name: '5 days', key: '5D' }"></ng-container>
      <ng-container *ngTemplateOutlet="priceChange; context: { name: '6 months', key: '6M' }"></ng-container>
      <ng-container *ngTemplateOutlet="priceChange; context: { name: '1 year', key: '1Y' }"></ng-container>
      <div class="hidden sm:block">
        <ng-container *ngTemplateOutlet="priceChange; context: { name: '5 years', key: '5Y' }"></ng-container>
      </div>
    </div>

    <div class="g-item-wrapper">
      <div>Company</div>
      <div class="flex items-center gap-2">
        <img appDefaultImg imageType="symbol" [src]="symbolSummary().id" alt="Asset Image" class="h-6 w-6" />
        <span class="hidden sm:block">{{ symbolSummary().profile?.companyName ?? symbolSummary().quote.name }}</span>
        <span class="sm:hidden">{{ symbolSummary().quote.symbol }}</span>
      </div>
    </div>

    <div class="g-item-wrapper">
      <span>Sector</span>
      <mat-chip-listbox>
        <mat-chip class="m-0" color="primary">
          {{ symbolSummary().profile?.sector ?? symbolSummary().quote.exchange }}
        </mat-chip>
      </mat-chip-listbox>
    </div>

    <div class="g-item-wrapper">
      <span>CEO</span>
      <span>{{ !!symbolSummary().profile?.ceo ? symbolSummary().profile?.ceo : 'N/A' }}</span>
    </div>

    <div class="g-item-wrapper">
      <span>Market Cap.</span>
      <div>
        <span>{{ symbolSummary().quote.price * symbolSummary().quote.sharesOutstanding | largeNumberFormatter }}</span>
        <span> ({{ symbolSummary().quote.timestamp * 1000 | date: 'MMM d, y' }}) </span>
      </div>
    </div>

    <div class="g-item-wrapper">
      <span>Price</span>
      <div class="flex items-center gap-2">
        <span>{{ symbolSummary().quote.price | currency }}</span>
        <span
          appPercentageIncrease
          [useCurrencySign]="true"
          [hideValueOnXsScreen]="true"
          [currentValues]="{
            hideValue: false,
            value: symbolSummary().quote.price,
            valueToCompare: symbolSummary().quote.previousClose,
          }"
        ></span>
      </div>
    </div>

    <div class="g-item-wrapper">
      <span>Volume</span>
      <div class="flex items-center gap-2">
        <span>{{ symbolSummary().quote.volume | largeNumberFormatter }}</span>
        <span
          appPercentageIncrease
          [useCurrencySign]="false"
          [hideValueOnXsScreen]="true"
          [currentValues]="{
            hideValue: false,
            value: symbolSummary().quote.volume,
            valueToCompare: symbolSummary().quote.avgVolume,
          }"
        ></span>
      </div>
    </div>

    <div class="g-item-wrapper">
      <span>PE / EPS</span>
      <span>
        {{ symbolSummary().quote.pe ? (symbolSummary().quote.pe | number: '1.2-2') : 'N/A' }} /
        {{ symbolSummary().quote.eps ? (symbolSummary().quote.eps | number: '1.2-2') : 'N/A' }}
      </span>
    </div>

    <!-- <div class="g-item-wrapper">
  <span>Rating</span>
  <div class="flex items-center gap-2">
    <span>{{ symbolSummary().rating?.rating ?? 'N/A' }}</span>
    <div>(<span [appRecommendation]="symbolSummary().rating?.ratingScore"></span>)</div>
  </div>
</div> -->

    <div class="g-item-wrapper">
      <span>Earnings</span>
      <span>{{
        symbolSummary().quote.earningsAnnouncement
          ? (symbolSummary().quote.earningsAnnouncement | date: 'MMMM d, y')
          : 'N/A'
      }}</span>
    </div>

    <!-- template render price change -->
    <ng-template #priceChange let-name="name" let-key="key">
      <div class="grid items-center justify-center gap-2">
        <span class="text-wt-gray-dark">{{ name }}</span>
        <span
          appPercentageIncrease
          [useCurrencySign]="false"
          [changeValues]="{
            changePercentage: symbolSummary().priceChange | priceChangeItemSelector: key,
          }"
        ></span>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SymbolSummaryListComponent {
  readonly symbolSummary = input.required<SymbolSummary>();
}
