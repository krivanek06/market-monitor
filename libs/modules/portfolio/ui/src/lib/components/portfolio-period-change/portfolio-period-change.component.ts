import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioChange } from '@mm/portfolio/data-access';
import { PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-period-change',
  standalone: true,
  imports: [PercentageIncreaseDirective],
  template: `
    <div class="@container">
      <div class="@md:grid-cols-2 @xl:grid-cols-4 grid gap-x-6 gap-y-2">
        <!-- daily -->
        @if (showData().daily) {
          <div>
            <div class="flex flex-col justify-between gap-1">
              <!-- name: weekly -->
              <div class="text-wt-gray-dark @sm:text-lg whitespace-nowrap text-center text-base">Daily</div>
              <!-- change: weekly -->
              @if (portfolioChange()['1_day']) {
                <div
                  class="justify-center text-center text-base"
                  appPercentageIncrease
                  [useCurrencySign]="true"
                  [changeValues]="{
                    changePercentage: portfolioChange()['1_day']?.valuePrct,
                    change: portfolioChange()['1_day']?.value,
                  }"
                ></div>
              } @else {
                <!-- no data -->
                <div class="text-wt-gray-medium @sm:text-lg text-center text-base">N/A</div>
              }
            </div>
          </div>
        }

        <!-- weekly -->
        @if (showData().weekly) {
          <div>
            <div class="flex flex-col justify-between gap-1">
              <!-- name: weekly -->
              <div class="text-wt-gray-dark @sm:text-lg whitespace-nowrap text-center text-base">Weekly</div>
              <!-- change: weekly -->
              @if (portfolioChange()['1_week']) {
                <div
                  class="justify-center text-center text-base"
                  appPercentageIncrease
                  [useCurrencySign]="true"
                  [changeValues]="{
                    changePercentage: portfolioChange()['1_week']?.valuePrct,
                    change: portfolioChange()['1_week']?.value,
                  }"
                ></div>
              } @else {
                <!-- no data -->
                <div class="text-wt-gray-medium @sm:text-lg text-center text-base">N/A</div>
              }
            </div>
          </div>
        }

        <!-- 2 weeks -->
        @if (showData().twoWeeks) {
          <div>
            <div class="flex flex-col justify-between gap-1">
              <!-- name: weekly -->
              <div class="text-wt-gray-dark @sm:text-lg whitespace-nowrap text-center text-base">2 Weeks</div>
              <!-- change: weekly -->
              @if (portfolioChange()['2_week']) {
                <div
                  class="justify-center text-center text-base"
                  appPercentageIncrease
                  [useCurrencySign]="true"
                  [changeValues]="{
                    changePercentage: portfolioChange()['2_week']?.valuePrct,
                    change: portfolioChange()['2_week']?.value,
                  }"
                ></div>
              } @else {
                <!-- no data -->
                <div class="text-wt-gray-medium @sm:text-lg text-center text-base">N/A</div>
              }
            </div>
          </div>
        }

        <!-- monthly -->
        @if (showData().monthly) {
          <div>
            <div class="flex flex-col justify-between gap-1">
              <!-- name: weekly -->
              <div class="text-wt-gray-dark @sm:text-lg whitespace-nowrap text-center text-base">Monthly</div>
              <!-- change: weekly -->
              @if (portfolioChange()['1_month']) {
                <div
                  class="justify-center text-center text-base"
                  appPercentageIncrease
                  [useCurrencySign]="true"
                  [changeValues]="{
                    changePercentage: portfolioChange()['1_month']?.valuePrct,
                    change: portfolioChange()['1_month']?.value,
                  }"
                ></div>
              } @else {
                <!-- no data -->
                <div class="text-wt-gray-medium @sm:text-lg text-center text-base">N/A</div>
              }
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
export class PortfolioPeriodChangeComponent {
  readonly portfolioChange = input.required<PortfolioChange>();
  readonly showData = input<{
    daily: boolean;
    weekly: boolean;
    twoWeeks: boolean;
    monthly: boolean;
  }>({
    daily: true,
    weekly: true,
    twoWeeks: true,
    monthly: true,
  });
}
