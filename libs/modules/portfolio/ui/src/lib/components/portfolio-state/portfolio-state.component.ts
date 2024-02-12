import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioState } from '@market-monitor/api-types';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { AddColorDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, AddColorDirective],
  template: `
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- balance -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Balance</div>
          <div [appAddColor]="valueColor" class="sm:text-lg">{{ portfolioState?.balance | currency }}</div>
        </div>

        <!-- Invested -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Invested</div>
          <div [appAddColor]="valueColor" class="sm:text-lg">{{ portfolioState?.holdingsBalance | currency }}</div>
        </div>

        <!-- Cash -->
        <div *ngIf="showCashSegment" class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Cash</div>
          <div [appAddColor]="valueColor" class="sm:text-lg">
            {{ portfolioState?.cashOnHand | currency }}
          </div>
        </div>

        <!-- Total Gains -->
        <div *ngIf="!showCashSegment" class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Total Gains</div>
          <div
            class="sm:text-lg"
            [appAddColor]="valueColor"
            appPercentageIncrease
            [changeValues]="{
              changePercentage: portfolioState?.totalGainsPercentage
            }"
          ></div>
        </div>

        <!-- Total Return -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="sm:text-lg">Total Return</div>
          <div
            class="sm:text-lg"
            [appAddColor]="valueColor"
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: portfolioState?.totalGainsValue,
              changePercentage: showCashSegment ? portfolioState?.totalGainsPercentage : undefined
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
export class PortfolioStateComponent {
  @Input() portfolioState?: PortfolioState;
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;
  @Input() showCashSegment = false;
}
