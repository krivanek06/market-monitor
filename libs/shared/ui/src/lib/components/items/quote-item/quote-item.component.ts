import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SymbolQuote } from '@mm/api-types';
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
    <div class="@container flex items-center justify-between">
      <!-- image and symbol -->
      <div class="flex max-w-[60%] items-center gap-3">
        <img appDefaultImg imageType="symbol" [src]="symbolQuote().symbol" alt="stock image" class="h-7 w-7" />
        <span class="text-wt-gray-dark block sm:hidden">{{ symbolQuote().symbol }}</span>
        <span class="text-wt-gray-dark hidden text-start sm:block">
          <span class="@xl:block hidden">{{ symbolQuote().name | truncate: 25 }}</span>
          <span class="@xl:hidden block">{{ symbolQuote().displaySymbol }}</span>
        </span>
      </div>
      <!-- price & price change -->
      <div class="xs:items-center xs:flex-row flex min-w-max flex-col items-end gap-x-3">
        <span class="text-wt-gray-medium">{{ symbolQuote().price | currency }}</span>
        <!-- show value change -->
        <span
          class="@xs:flex hidden"
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: symbolQuote().change,
            changePercentage: symbolQuote().changesPercentage,
          }"
        ></span>
        <!-- hide value change -->
        <span
          class="@xs:hidden flex"
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: symbolQuote().change,
          }"
        ></span>
      </div>
    </div>
  `,
})
export class QuoteItemComponent {
  symbolQuote = input.required<SymbolQuote>();
}
