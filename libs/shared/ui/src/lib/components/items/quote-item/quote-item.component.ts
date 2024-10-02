import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SymbolQuote } from '@mm/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '../../../directives';
import { LargeNumberFormatterPipe, TruncatePipe } from '../../../pipes';

@Component({
  selector: 'app-quote-item',
  standalone: true,
  imports: [CurrencyPipe, PercentageIncreaseDirective, LargeNumberFormatterPipe, TruncatePipe, DefaultImgDirective],
  template: `
    <!-- first line -->
    <div class="@container flex items-center justify-between">
      <!-- image and symbol -->
      <div class="flex max-w-[60%] items-center gap-3">
        @if (displayImage()) {
          <img appDefaultImg imageType="symbol" [src]="symbolQuote().symbol" alt="stock image" class="h-7 w-7" />
        }
        <span class="text-wt-gray-dark block sm:hidden">{{ symbolQuote().symbol }}</span>
        <span class="text-wt-gray-dark hidden text-start sm:block">
          <span class="@lg:block hidden">{{ symbolQuote().name | truncate: 25 }}</span>
          <span class="@lg:hidden block">{{ symbolQuote().displaySymbol | truncate: 25 }}</span>
        </span>
      </div>
      <!-- price & price change -->
      <div class="flex min-w-max items-center gap-x-3">
        <span class="text-wt-gray-medium">{{ symbolQuote().price | currency }}</span>
        <!-- show value change -->
        <span
          class="@sm:flex hidden"
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: symbolQuote().change,
            changePercentage: symbolQuote().changesPercentage,
          }"
        ></span>
        <!-- hide value change -->
        <span
          class="@sm:hidden flex"
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            changePercentage: symbolQuote().changesPercentage,
          }"
        ></span>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteItemComponent {
  readonly symbolQuote = input.required<SymbolQuote>();
  readonly displayImage = input<boolean>(true);
}
