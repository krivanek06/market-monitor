import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioState } from '@mm/api-types';
import { ColorScheme } from '@mm/shared/data-access';
import { AddColorDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-state-transactions',
  standalone: true,
  imports: [AddColorDirective, CurrencyPipe],
  template: `
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- Total -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Total</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{
              (portfolioState()?.numberOfExecutedBuyTransactions ?? 0) +
                (portfolioState()?.numberOfExecutedSellTransactions ?? 0)
            }}
          </div>
        </div>

        <!-- Buy -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Buy</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ portfolioState()?.numberOfExecutedBuyTransactions ?? 'N/A' }}
          </div>
        </div>

        <!-- Sell -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Sell</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ portfolioState()?.numberOfExecutedSellTransactions ?? 'N/A' }}
          </div>
        </div>

        <!-- Fees -->
        @if (showFees()) {
          <div class="@md:flex-col flex justify-between">
            <div [appAddColor]="titleColor()" class="sm:text-lg">Fees</div>
            <div [appAddColor]="valueColor()" class="sm:text-lg">
              {{ (portfolioState()?.transactionFees | currency) ?? 'N/A' }}
            </div>
          </div>
        }
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
  readonly portfolioState = input<PortfolioState | undefined>();
  readonly showFees = input(false);
  readonly titleColor = input<ColorScheme | undefined>();
  readonly valueColor = input<ColorScheme | undefined>();
}
