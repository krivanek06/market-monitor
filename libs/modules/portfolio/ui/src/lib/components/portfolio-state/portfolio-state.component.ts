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
          <div [appAddColor]="titleColor" class="text-lg">Balance</div>
          <div [appAddColor]="valueColor" class="text-lg">{{ portfolioState.balance | currency }}</div>
        </div>

        <!-- Invested -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="text-lg">Invested</div>
          <div [appAddColor]="valueColor" class="text-lg">{{ portfolioState.invested | currency }}</div>
        </div>

        <!-- Cash -->
        <div *ngIf="showCashSegment" class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="text-lg">Cash</div>
          <div [appAddColor]="valueColor" class="text-lg">
            {{ portfolioState.cashOnHand | currency }} / {{ portfolioState.startingCash | currency }}
          </div>
        </div>

        <!-- Total Gains -->
        <div *ngIf="!showCashSegment" class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="text-lg">Total Gains</div>
          <div
            class="text-lg"
            [appAddColor]="valueColor"
            appPercentageIncrease
            [changeValues]="{
              changePercentage: portfolioState.totalGainsPercentage
            }"
          ></div>
        </div>

        <!-- Total Return -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="text-lg">Total Return</div>
          <div
            class="text-lg"
            [appAddColor]="valueColor"
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: portfolioState.totalGainsValue,
              changePercentage: showCashSegment ? portfolioState.totalGainsPercentage : undefined
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
  @Input({ required: true }) portfolioState!: PortfolioState;
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;
  @Input() showCashSegment = false;
}
