import { CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CalendarStockEarning, StockEarning } from '@mm/api-types';
import { DefaultImgDirective, LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-earnings-item',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgClass,
    DefaultImgDirective,
    MatButtonModule,
    PercentageIncreaseDirective,
    LargeNumberFormatterPipe,
  ],
  template: `
    <button (click)="onItemClick()" type="button" mat-button class="w-full">
      <div class="flex items-center justify-between py-1" [ngClass]="{ 'g-border-bottom': showBorder() }">
        <div class="flex items-center gap-3">
          <img appDefaultImg imageType="symbol" [src]="earning().symbol" alt="asset url" class="h-7 w-7" />
          <span>{{ earning().symbol }}</span>
        </div>

        <div class="flex items-center gap-4">
          <!-- earnings -->
          <div class="flex items-center gap-1">
            <span>{{ earning().eps ? (earning().eps | currency) : 'N/A' }}</span>
            @if (earning().eps && earning().epsEstimated) {
              <div class="flex items-center" [ngClass]="{ 'max-sm:hidden': showRevenue() }">
                <span>(</span>
                <span
                  appPercentageIncrease
                  [currentValues]="{
                    value: earning().eps ?? 0,
                    valueToCompare: earning().epsEstimated ?? 0,
                    hideValue: true,
                  }"
                ></span>
                <span>)</span>
              </div>
            }
          </div>

          @if (showRevenue()) {
            <div>/</div>

            <!-- revenue -->
            <div class="flex items-center gap-1">
              <span>{{ earning().revenue ? (earning().revenue | largeNumberFormatter) : 'N/A' }}</span>
              @if (earning().revenue && earning().revenueEstimated) {
                <div class="hidden items-center sm:flex">
                  <span>(</span>
                  <span
                    appPercentageIncrease
                    [currentValues]="{
                      value: earning().revenue ?? 0,
                      valueToCompare: earning().revenueEstimated ?? 0,
                      hideValue: true,
                    }"
                  ></span>
                  <span>)</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </button>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarningsItemComponent {
  readonly itemClickedEmitter = output<void>();
  readonly earning = input.required<StockEarning | CalendarStockEarning>();
  readonly showBorder = input(false);
  /** whether to also show revenue part */
  readonly showRevenue = input(false);

  onItemClick(): void {
    this.itemClickedEmitter.emit();
  }
}
