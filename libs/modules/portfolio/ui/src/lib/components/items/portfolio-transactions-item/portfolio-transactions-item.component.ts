import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioTransaction } from '@mm/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-transactions-item',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, DefaultImgDirective],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- image  -->
        <img appDefaultImg imageType="symbol" [src]="transaction().symbol" class="w-10 h-10" />
        <!-- symbol &  date -->
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <div class="text-wt-primary">{{ transaction().symbol }}</div>
            <div>|</div>
            <div
              [ngClass]="{
                'text-wt-danger': transaction().transactionType === 'SELL',
                'text-wt-success': transaction().transactionType === 'BUY'
              }"
            >
              {{ transaction().transactionType }}
            </div>
          </div>
          <div class="text-wt-gray-medium">{{ transaction().date | date: 'MMMM d, y' }}</div>
        </div>
      </div>

      <!-- total & return -->
      <div class="flex flex-col items-end">
        <div class="flex items-center gap-2">
          <div class="text-wt-gray-dark">{{ transaction().units * transaction().unitPrice | currency }}</div>
          <div class="text-wt-gray-medium">({{ transaction().units }})</div>
        </div>
        <div
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: transaction().returnValue,
            changePercentage: transaction().returnChange
          }"
        ></div>
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
export class PortfolioTransactionsItemComponent {
  transaction = input.required<PortfolioTransaction>();
}
