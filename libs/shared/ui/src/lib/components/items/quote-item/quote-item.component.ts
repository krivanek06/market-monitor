import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
    <div class="flex items-center justify-between">
      <!-- image and symbol -->
      <div class="flex items-center gap-3 max-w-[60%]">
        <img appDefaultImg imageType="symbol" [src]="symbolQuote.symbol" alt="stock image" class="w-7 h-7" />
        <span class="block sm:hidden text-wt-gray-dark">{{ symbolQuote.symbol }}</span>
        <span class="hidden sm:block text-start text-wt-gray-dark">
          <ng-container *ngIf="displayValue === 'name'">{{ symbolQuote.name | truncate: 25 }}</ng-container>
          <ng-container *ngIf="displayValue === 'symbol'">{{ symbolQuote.symbol }}</ng-container>
        </span>
      </div>
      <!-- price & price change -->
      <div class="flex flex-col items-end xs:items-center gap-x-3 xs:flex-row min-w-max">
        <span class="text-base text-wt-gray-medium">{{ symbolQuote.price | currency }}</span>
        <span
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: showValueChange ? symbolQuote.change : undefined,
            changePercentage: symbolQuote.changesPercentage
          }"
        ></span>
      </div>
    </div>
  `,
})
export class QuoteItemComponent {
  @Input({ required: true }) symbolQuote!: SymbolQuote;
  @Input() showValueChange = true;
  @Input() displayValue: 'name' | 'symbol' = 'name';
}
