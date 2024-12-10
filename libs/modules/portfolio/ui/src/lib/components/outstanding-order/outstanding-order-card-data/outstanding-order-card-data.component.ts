import { CurrencyPipe, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IsStockMarketOpenExtend, OutstandingOrder } from '@mm/api-types';
import { getTransactionFeesBySpending } from '@mm/shared/general-util';
import { DefaultImgDirective, GeneralCardComponent } from '@mm/shared/ui';
import { roundToNearestMinutes } from 'date-fns';

@Component({
  selector: 'app-outstanding-order-card-data',
  standalone: true,
  imports: [
    GeneralCardComponent,
    DefaultImgDirective,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    NgClass,
    NgTemplateOutlet,
  ],
  template: `
    <app-general-card>
      <!-- symbol + image -->
      <div class="flex items-center gap-2">
        <img appDefaultImg imageType="symbol" [src]="order().symbol" class="h-8 w-8" />
        <div class="-mt-1 flex flex-1 flex-col">
          <div class="flex items-center justify-between">
            <!-- symbol + order type -->
            <div class="flex gap-2">
              <div class="text-wt-gray-dark">{{ order().displaySymbol }}</div>
              <div
                [ngClass]="{
                  'text-wt-success': order().orderType.type === 'BUY',
                  'text-wt-danger': order().orderType.type === 'SELL',
                }"
              >
                {{ order().orderType.type }}
              </div>
            </div>

            <!-- delete button -->
            <div class="flex items-center gap-2">
              <button mat-icon-button type="button" color="warn" (click)="onDelete()">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <div class="-mt-1 text-sm">{{ order().createdAt | date: 'HH:mm MMM d, y' }}</div>
        </div>
      </div>

      <!-- content -->
      <div class="p-2">
        <ng-container *ngTemplateOutlet="normalOrderTmp; context: { order: order() }" />
      </div>
    </app-general-card>

    <!-- normal order - IN FUTURE THERE WILL BE OTHER DIFFERENT ORDERS -->
    <ng-template #normalOrderTmp let-order="order">
      <div>
        <div class="g-item-wrapper">
          <span>Executes At</span>
          <span>{{ executionTime() | date: 'HH:mm MMM d, y' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Units / Fees</span>
          <span>{{ order.units }} / ~{{ potentialFees() | currency }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Price</span>
          <span>~{{ order.potentialSymbolPrice | currency }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Total</span>
          <span>~{{ order.potentialTotalPrice | currency }}</span>
        </div>
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
export class OutstandingOrderCardDataComponent {
  readonly deleteClicked = output<void>();
  readonly order = input.required<OutstandingOrder>();
  readonly marketOpen = input<IsStockMarketOpenExtend>();

  readonly potentialFees = computed(() => getTransactionFeesBySpending(this.order().potentialTotalPrice));
  readonly executionTime = computed(() => {
    const marketOpen = this.marketOpen();

    // not provided market data
    if (!marketOpen) {
      return '';
    }

    const now = new Date();

    // market hasn't opened yet
    if (!marketOpen.isTheStockMarketOpen) {
      const openingHour = marketOpen.stockMarketHoursLocal.openingHour;
      // format opening hour to date
      const [hour, minute] = openingHour.split(':').map(Number);
      const openingDate = new Date(now);
      openingDate.setHours(hour, minute, 0, 0);
      return openingDate.toString();
    }

    // market is open, round to nearest 5 minutes
    return roundToNearestMinutes(now, { nearestTo: 5 });
  });

  onDelete() {
    this.deleteClicked.emit();
  }
}
