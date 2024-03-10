import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SymbolQuote } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '../../../directives';
import { LargeNumberFormatterPipe, TruncatePipe } from '../../../pipes';

@Component({
  selector: 'app-quote-item',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, LargeNumberFormatterPipe, TruncatePipe, DefaultImgDirective],
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- first line -->
    <div class="flex items-center justify-between @container">
      <!-- image and symbol -->
      <div class="flex items-center gap-3 max-w-[60%]">
        <img appDefaultImg imageType="symbol" [src]="symbolQuote().symbol" alt="stock image" class="w-7 h-7" />
        <span class="block sm:hidden text-wt-gray-dark">{{ symbolQuote().symbol }}</span>
        <span class="hidden sm:block text-start text-wt-gray-dark">
          <span class="hidden @xl:block">{{ symbolQuote().name | truncate: 25 }}</span>
          <span class="block @xl:hidden">{{ symbolQuote().symbol }}</span>
        </span>
      </div>
      <!-- price & price change -->
      <div class="flex flex-col items-end xs:items-center gap-x-3 xs:flex-row min-w-max">
        <span class="text-base text-wt-gray-medium">{{ symbolQuote().price | currency }}</span>
        <!-- show value change -->
        <span
          class="hidden @xs:flex"
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: symbolQuote().change,
            changePercentage: symbolQuote().changesPercentage
          }"
        ></span>
        <!-- hide value change -->
        <span
          class="flex @xs:hidden"
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: symbolQuote().change
          }"
        ></span>
      </div>
    </div>
  `,
})
export class QuoteItemComponent {
  symbolQuote = input.required<SymbolQuote>();
}
