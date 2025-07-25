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
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <!-- symbol -->
            <div class="text-wt-primary">{{ transaction().displaySymbol ?? transaction().symbol }}</div>
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
              @if (dateType() === 'date') {
                <div class="text-wt-gray-medium text-sm">{{ transaction().date | date: 'MMM d, y' }}</div>
              } @else if (dateType() === 'round') {
                <div class="text-wt-gray-medium text-sm">Round: {{ transaction().date }}</div>
              }
            }
          </div>

          <!-- user -->
          @if (displayUser()) {
            <div class="flex items-center gap-2">
              <img
                appDefaultImg
                imageType="default"
                [src]="transaction().userPhotoURL"
                class="h-5 w-5 rounded-lg opacity-85"
              />
              <div class="text-wt-gray-medium text-sm">{{ transaction().userDisplayName ?? 'Unknown' }}</div>
            </div>
          } @else {
            <!-- date -->
            @if (dateType() === 'date') {
              <div class="text-wt-gray-medium text-sm">{{ transaction().date | date: 'MMMM d, y' }}</div>
            } @else if (dateType() === 'round') {
              <div class="text-wt-gray-medium text-sm">Round: {{ transaction().date }}</div>
            }
          }
        </div>
      </div>

      <!-- total & return -->
      <div class="flex flex-col items-end">
        @if (transaction().returnValue) {
          <!-- total return -->
          <div
            class="max-xs:hidden"
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: transaction().returnValue,
              changePercentage: transaction().returnChange,
            }"
          ></div>

          <div
            class="xs:hidden"
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              changePercentage: transaction().returnChange,
            }"
          ></div>
        }

        <!-- value transacted -->
        <div
          class="flex items-center gap-2"
          [ngClass]="{
            'text-sm': transaction().returnValue !== 0,
          }"
        >
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

  readonly dateType = input<'date' | 'round'>('date');
}
