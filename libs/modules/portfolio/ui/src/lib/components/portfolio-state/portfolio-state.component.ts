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
    <div [class]="classes">
      <!-- balance -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Balance</div>
        <div [appAddColor]="valueColor" class="text-xl">{{ portfolioState.balance | currency }}</div>
      </div>

      <!-- Invested -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Invested</div>
        <div [appAddColor]="valueColor" class="text-xl">{{ portfolioState.invested | currency }}</div>
      </div>

      <!-- Cash -->
      <div *ngIf="showCashSegment" [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Cash</div>
        <div [appAddColor]="valueColor" class="text-xl">
          {{ portfolioState.cashOnHand | currency }} / {{ portfolioState.startingCash | currency }}
        </div>
      </div>

      <!-- Total Gains -->
      <div *ngIf="!showCashSegment" [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Total Gains</div>
        <div
          class="text-xl"
          [appAddColor]="valueColor"
          appPercentageIncrease
          [changeValues]="{
            changePercentage: portfolioState.totalGainsPercentage
          }"
        ></div>
      </div>

      <!-- Total Return -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Total Return</div>
        <div
          class="text-xl"
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
export class PortfolioStateComponent {
  @Input({ required: true }) portfolioState!: PortfolioState;
  @Input() classes = 'grid gap-4 sm:grid-cols-2';
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;
  @Input() isLayoutHorizontal = false;
  @Input() showCashSegment = false;

  get valueClasses(): string {
    const position = this.isLayoutHorizontal ? 'flex-row justify-between' : 'flex-col';
    return `flex gap-y-2 ${position}`;
  }
}
