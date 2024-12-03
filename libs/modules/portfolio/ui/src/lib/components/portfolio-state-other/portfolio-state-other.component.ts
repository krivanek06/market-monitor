import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OutstandingOrder, PortfolioState } from '@mm/api-types';
import { ColorScheme } from '@mm/shared/data-access';
import { AddColorDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-state-other',
  standalone: true,
  imports: [AddColorDirective, CurrencyPipe],
  template: `
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- invested -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Invested</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ (portfolioState()?.invested | currency) ?? 'N/A' }}
          </div>
        </div>

        <!-- locked cash -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Locked Cash</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ lockedCash() | currency }}
          </div>
        </div>

        <!-- open / sell orders -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Orders B/S</div>
          <div [appAddColor]="valueColor()" class="space-x-1 sm:text-lg">
            <span>{{ openBuyOrders()?.length ?? 0 }}</span>
            <span>/</span>
            <span>{{ openSellOrders()?.length ?? 0 }}</span>
          </div>
        </div>

        <!-- rank -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Ranking</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ hallOfFameRank() ?? 'N/A' }}
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
export class PortfolioStateOtherComponent {
  readonly portfolioState = input<PortfolioState | undefined>();
  readonly openOrders = input<OutstandingOrder[]>();
  readonly hallOfFameRank = input<number | undefined>();
  readonly titleColor = input<ColorScheme | undefined>();
  readonly valueColor = input<ColorScheme | undefined>();

  readonly lockedCash = computed(
    () => this.openOrders()?.reduce((acc, curr) => acc + curr.potentialTotalPrice, 0) ?? 0,
  );
  readonly openBuyOrders = computed(() => this.openOrders()?.filter((order) => order.orderType.type === 'BUY'));
  readonly openSellOrders = computed(() => this.openOrders()?.filter((order) => order.orderType.type === 'SELL'));
}
