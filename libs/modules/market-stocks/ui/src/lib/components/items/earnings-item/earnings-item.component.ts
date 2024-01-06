import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CalendarStockEarning, StockEarning } from '@market-monitor/api-types';
import { DefaultImgDirective, LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-earnings-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, MatButtonModule, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  template: `
    <button (click)="onItemClick()" type="button" mat-button class="w-full">
      <div class="flex items-center justify-between py-1" [ngClass]="{ 'g-border-bottom': showBorder }">
        <div class="flex items-center gap-3">
          <img appDefaultImg imageType="symbol" [src]="earning.symbol" alt="asset url" class="h-7 w-7" />
          <span>{{ earning.symbol }}</span>
        </div>

        <div class="flex items-center gap-4">
          <!-- earnings -->
          <div class="flex items-center gap-1">
            <span>{{ earning.eps ? (earning.eps | currency) : 'N/A' }}</span>
            <div *ngIf="earning.eps && earning.epsEstimated" class="flex items-center">
              <span>(</span>
              <span
                appPercentageIncrease
                [currentValues]="{
                  value: earning.eps,
                  valueToCompare: earning.epsEstimated,
                  hideValue: true
                }"
              ></span>
              <span>)</span>
            </div>
          </div>

          <div *ngIf="showRevenue">/</div>

          <!-- revenue -->
          <div *ngIf="showRevenue" class="items-center gap-1 hiddem sm:flex">
            <span>{{ earning.revenue ? (earning.revenue | largeNumberFormatter) : 'N/A' }}</span>
            <div *ngIf="earning.revenue && earning.revenueEstimated" class="flex items-center">
              <span>(</span>
              <span
                appPercentageIncrease
                [currentValues]="{
                  value: earning.revenue,
                  valueToCompare: earning.revenueEstimated,
                  hideValue: true
                }"
              ></span>
              <span>)</span>
            </div>
          </div>
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
  @Output() itemClickedEmitter = new EventEmitter<void>();
  @Input({ required: true }) earning!: StockEarning | CalendarStockEarning;
  @Input() showBorder = false;
  @Input() showRevenue = false;

  onItemClick(): void {
    this.itemClickedEmitter.emit();
  }
}
