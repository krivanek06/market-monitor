import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortfolioState } from '@mm/api-types';
import { ColorScheme } from '@mm/shared/data-access';
import { AddColorDirective, animationValueChange, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-state',
  standalone: true,
  imports: [PercentageIncreaseDirective, AddColorDirective, MatProgressSpinnerModule, CurrencyPipe],
  animations: [animationValueChange],
  template: `
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- balance -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Balance</div>
          <div [appAddColor]="valueColor()" class="flex items-center gap-2 sm:text-lg">
            <span>{{ (portfolioState()?.balance | currency) ?? 'N/A' }}</span>
            @if (showSpinner()) {
              <mat-spinner [diameter]="20" />
            }
          </div>
        </div>

        <!-- Invested -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Holdings</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg" [@valueChange]="portfolioState()?.holdingsBalance">
            {{ (portfolioState()?.holdingsBalance | currency) ?? 'N/A' }}
          </div>
        </div>

        <!-- Cash -->
        @if (showCashSegment()) {
          <div class="@md:flex-col flex justify-between">
            <div [appAddColor]="titleColor()" class="sm:text-lg">Cash</div>
            <div [appAddColor]="valueColor()" class="sm:text-lg" [@valueChange]="portfolioState()?.cashOnHand">
              {{ (portfolioState()?.cashOnHand | currency) ?? 'N/A' }}
            </div>
          </div>
        } @else {
          <!-- Total Gains -->
          <div class="@md:flex-col flex justify-between">
            <div [appAddColor]="titleColor()" class="sm:text-lg">Total Gains</div>
            <div
              class="sm:text-lg"
              [appAddColor]="valueColor()"
              appPercentageIncrease
              [changeValues]="{
                changePercentage: portfolioState()?.totalGainsPercentage,
              }"
            ></div>
          </div>
        }

        <!-- Total Return -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Total Return</div>
          <div
            class="sm:text-lg"
            [appAddColor]="valueColor()"
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: portfolioState()?.totalGainsValue,
              changePercentage: showCashSegment() ? portfolioState()?.totalGainsPercentage : undefined,
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
  readonly portfolioState = input<PortfolioState | undefined>();
  readonly titleColor = input<ColorScheme | undefined>();
  readonly valueColor = input<ColorScheme | undefined>();
  readonly showCashSegment = input(false);
  readonly showSpinner = input(false);
}
