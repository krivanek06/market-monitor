import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioState } from '@market-monitor/api-types';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { AddColorDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state-transactions',
  standalone: true,
  imports: [CommonModule, AddColorDirective],
  template: `
    <div [class]="classes">
      <!-- Total -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Total</div>
        <div [appAddColor]="valueColor" class="text-xl">
          {{ portfolioState.numberOfExecutedBuyTransactions + portfolioState.numberOfExecutedSellTransactions }}
        </div>
      </div>

      <!-- Buy -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Buy</div>
        <div [appAddColor]="valueColor" class="text-xl">{{ portfolioState.numberOfExecutedBuyTransactions }}</div>
      </div>

      <!-- Sell -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Sell</div>
        <div [appAddColor]="valueColor" class="text-xl">{{ portfolioState.numberOfExecutedSellTransactions }}</div>
      </div>

      <!-- Fees -->
      <div *ngIf="showFees" [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Fees</div>
        <div [appAddColor]="valueColor" class="text-xl">
          {{ portfolioState.transactionFees | currency }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioStateTransactionsComponent {
  @Input({ required: true }) portfolioState!: PortfolioState;
  @Input() showFees = false;
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;
  @Input() isLayoutHorizontal = false;
  @Input() classes = 'grid gap-4 sm:grid-cols-2';

  get valueClasses(): string {
    const position = this.isLayoutHorizontal ? 'flex-row justify-between' : 'flex-col';
    return `flex gap-y-2 ${position}`;
  }
}
