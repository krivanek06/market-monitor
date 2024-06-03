import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioChange } from '@mm/portfolio/data-access';
import { PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-period-change',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective],
  template: `
    <div class="@container">
      <div class="@md:grid-cols-2 @xl:grid-cols-6 grid gap-x-6 gap-y-2">
        <ng-container
          *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange()['1_day'], name: 'Daily' }"
        ></ng-container>
        <ng-container
          *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange()['1_week'], name: 'Weekly' }"
        ></ng-container>
        <ng-container
          *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange()['2_week'], name: '2 Weeks' }"
        ></ng-container>
        <ng-container
          *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange()['1_month'], name: 'Monthly' }"
        ></ng-container>
        <ng-container
          *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange()['3_month'], name: 'Quarterly' }"
        ></ng-container>
        <ng-container
          *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange()['6_month'], name: 'Half Year' }"
        ></ng-container>
      </div>
    </div>

    <!-- template -->
    <ng-template #dataTemplate let-change="change" let-name="name">
      <div class="@container/item">
        <div class="flex flex-row justify-between gap-1 sm:flex-col">
          <!-- name: weekly -->
          <div class="text-wt-gray-dark @sm/item:text-lg whitespace-nowrap text-center text-base">{{ name }}</div>
          <!-- change: weekly -->
          <ng-container *ngIf="change; else noData">
            <div
              class="@sm/item:text-lg justify-center text-center text-base"
              appPercentageIncrease
              [useCurrencySign]="true"
              [changeValues]="{ changePercentage: change.valuePrct, change: change.value }"
            ></div>
          </ng-container>
          <!-- no data -->
          <ng-template #noData>
            <div class="text-wt-gray-medium @sm/item:text-lg text-center text-base">N/A</div>
          </ng-template>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioPeriodChangeComponent {
  portfolioChange = input.required<PortfolioChange>();
}
