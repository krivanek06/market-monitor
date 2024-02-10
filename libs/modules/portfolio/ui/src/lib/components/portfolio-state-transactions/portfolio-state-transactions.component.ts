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
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- Total -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Total</div>
          <div [appAddColor]="valueColor" class="sm:text-lg">
            {{
              (portfolioState?.numberOfExecutedBuyTransactions ?? 0) +
                (portfolioState?.numberOfExecutedSellTransactions ?? 0)
            }}
          </div>
        </div>

        <!-- Buy -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Buy</div>
          <div [appAddColor]="valueColor" class="sm:text-lg">{{ portfolioState?.numberOfExecutedBuyTransactions }}</div>
        </div>

        <!-- Sell -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Sell</div>
          <div [appAddColor]="valueColor" class="sm:text-lg">
            {{ portfolioState?.numberOfExecutedSellTransactions }}
          </div>
        </div>

        <!-- Fees -->
        <div *ngIf="showFees" class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Fees</div>
          <div [appAddColor]="valueColor" class="sm:text-lg">
            {{ portfolioState?.transactionFees | currency }}
          </div>
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
export class PortfolioStateTransactionsComponent {
  @Input() portfolioState?: PortfolioState;
  @Input() showFees = false;
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;
}
