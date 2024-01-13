import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioChange } from '@market-monitor/modules/portfolio/data-access';
import { PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-period-change',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective],
  template: `
    <div class="grid sm:grid-cols-2 lg:grid-cols-6 gap-x-6">
      <ng-container
        *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange['1_day'], name: 'Daily' }"
      ></ng-container>
      <ng-container
        *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange['1_week'], name: 'Weekly' }"
      ></ng-container>
      <ng-container
        *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange['2_week'], name: 'Half Month' }"
      ></ng-container>
      <ng-container
        *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange['1_month'], name: 'Monthly' }"
      ></ng-container>
      <ng-container
        *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange['3_month'], name: 'Quarterly' }"
      ></ng-container>
      <ng-container
        *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange['6_month'], name: 'Half Year' }"
      ></ng-container>
    </div>

    <!-- template -->
    <ng-template #dataTemplate let-change="change" let-name="name">
      <div class="@container">
        <div class="flex flex-col justify-between gap-1 @sm:flex-row">
          <!-- name: weekly -->
          <div class="text-base text-center text-wt-gray-medium @sm:text-lg whitespace-nowrap">{{ name }}</div>
          <!-- change: weekly -->
          <ng-container *ngIf="change; else noData">
            <div
              class="justify-center text-base text-center @sm:text-lg"
              appPercentageIncrease
              [useCurrencySign]="true"
              [changeValues]="{ changePercentage: change.valuePrct, change: change.value }"
            ></div>
          </ng-container>
          <!-- no data -->
          <ng-template #noData>
            <div class="text-base text-center text-wt-gray-medium @sm:text-lg">N/A</div>
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
  @Input({ required: true }) portfolioChange!: PortfolioChange;
}
