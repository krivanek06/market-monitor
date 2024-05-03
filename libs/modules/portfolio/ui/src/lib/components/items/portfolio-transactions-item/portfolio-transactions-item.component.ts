import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioTransactionMore } from '@mm/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-transactions-item',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, DefaultImgDirective, DefaultImgDirective],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- image  -->
        <img appDefaultImg imageType="symbol" [src]="transaction().symbol" class="w-10 h-10" />
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
                'text-wt-success': transaction().transactionType === 'BUY'
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
              <img appDefaultImg imageType="default" [src]="transaction().userPhotoURL" class="w-6 h-6 rounded-lg" />
              <div class="text-wt-gray-dark">{{ transaction().userDisplayName ?? 'Unknown' }}</div>
            </div>
          } @else {
            <!-- date -->
            <div class="text-wt-gray-medium">{{ transaction().date | date: 'MMMM d, y' }}</div>
          }
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
  transaction = input.required<PortfolioTransactionMore>();

  /**
   * whether to display user who made the transaction
   */
  displayUser = input<boolean>(false);
}
