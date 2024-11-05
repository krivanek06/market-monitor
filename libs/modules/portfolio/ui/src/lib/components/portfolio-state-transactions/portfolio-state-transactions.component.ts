import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioState } from '@mm/api-types';
import { ColorScheme } from '@mm/shared/data-access';
import { AddColorDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-state-transactions',
  standalone: true,
  imports: [PercentageIncreaseDirective, AddColorDirective, CurrencyPipe],
  template: `
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- Buy / Sell -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Buy / Sell</div>
          <div [appAddColor]="valueColor()" class="space-x-1 sm:text-lg">
            <span>{{ portfolioState()?.numberOfExecutedBuyTransactions ?? 'N/A' }}</span>
            <span>/</span>
            <span>{{ portfolioState()?.numberOfExecutedSellTransactions ?? 'N/A' }}</span>
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

        <!-- realized profit -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Returns</div>
          <div
            class="sm:text-lg"
            [appAddColor]="valueColor()"
            appPercentageIncrease
            [useCurrencySign]="true"
            [roundValOnThousands]="false"
            [currentValues]="{
              value: portfolioState()?.transactionProfit ?? 0,
              valueToCompare: 0,
              hidePercentage: true,
            }"
          ></div>
        </div>

        <!-- net profit -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Net Profit</div>
          <div
            class="sm:text-lg"
            [appAddColor]="valueColor()"
            appPercentageIncrease
            [useCurrencySign]="true"
            [roundValOnThousands]="false"
            [currentValues]="{
              value: (portfolioState()?.transactionProfit ?? 0) - (portfolioState()?.transactionFees ?? 0),
              valueToCompare: 0,
              hidePercentage: true,
            }"
          ></div>
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
  readonly portfolioState = input<PortfolioState | undefined>();
  readonly showFees = input(false);
  readonly titleColor = input<ColorScheme | undefined>();
  readonly valueColor = input<ColorScheme | undefined>();
}
