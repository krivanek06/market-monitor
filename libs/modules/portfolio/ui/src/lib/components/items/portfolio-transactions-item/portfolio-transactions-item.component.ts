import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioTransactionMore } from '@mm/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-transactions-item',
  standalone: true,
  imports: [PercentageIncreaseDirective, DefaultImgDirective, DefaultImgDirective, NgClass, DatePipe, CurrencyPipe],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- image  -->
        <img appDefaultImg imageType="symbol" [src]="transaction().symbol" class="h-8 w-8" />
        <!-- symbol &  date -->
        <div class="flex flex-col" [ngClass]="{ 'gap-y-2': displayUser() }">
          <div class="flex items-center gap-2">
            <!-- symbol -->
            <div class="text-wt-primary">{{ transaction().symbol }}</div>
            <div>|</div>
            <!-- transaction type -->
            <div
              [ngClass]="{
                'text-wt-danger': transaction().transactionType === 'SELL',
                'text-wt-success': transaction().transactionType === 'BUY',
              }"
            >
              {{ transaction().transactionType }}
            </div>
            @if (displayUser()) {
              <div>|</div>
              <!-- date -->
              <div class="text-wt-gray-medium">{{ transaction().date | date: 'MMM. d, y' }}</div>
            }
          </div>

          <!-- user -->
          @if (displayUser()) {
            <div class="flex items-center gap-2">
              <img appDefaultImg imageType="default" [src]="transaction().userPhotoURL" class="h-6 w-6 rounded-lg" />
              <div class="text-wt-gray-dark">{{ transaction().userDisplayName ?? 'Unknown' }}</div>
            </div>
          } @else {
            <!-- date -->
            <div class="text-wt-gray-medium text-sm">{{ transaction().date | date: 'MMMM d, y' }}</div>
          }
        </div>
      </div>

      <!-- total & return -->
      <div class="flex flex-col items-end">
        <!-- total return -->
        <div
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: transaction().returnValue,
            changePercentage: transaction().returnChange,
          }"
        ></div>

        <!-- value transacted -->
        <div class="flex items-center gap-2 text-sm">
          <div class="text-wt-gray-dark">{{ transaction().units * transaction().unitPrice | currency }}</div>
          <div class="text-wt-gray-medium">({{ transaction().units }})</div>
        </div>
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
  readonly transaction = input.required<PortfolioTransactionMore>();

  /**
   * whether to display user who made the transaction
   */
  readonly displayUser = input<boolean>(false);
}
