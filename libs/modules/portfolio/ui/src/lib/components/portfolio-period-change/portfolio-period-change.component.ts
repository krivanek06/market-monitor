import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioChange } from '@market-monitor/modules/portfolio/data-access';
import { PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-period-change',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective],
  template: `
    <div class="flex justify-between gap-2 xl:flex-wrap">
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
      <ng-container
        *ngTemplateOutlet="dataTemplate; context: { change: portfolioChange['1_year'], name: 'Yearly' }"
      ></ng-container>
    </div>

    <!-- template -->
    <ng-template #dataTemplate let-change="change" let-name="name">
      <div class="flex flex-row justify-between gap-1 sm:flex-col">
        <div class="text-base text-center text-wt-gray-medium sm:text-lg whitespace-nowrap">{{ name }}</div>
        <ng-container *ngIf="change; else noData">
          <div
            class="justify-center text-base text-center xs:text-lg sm:text-xl"
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{ changePercentage: change.valuePrct, change: change.value }"
          ></div>
        </ng-container>
        <ng-template #noData>
          <div class="text-base text-center text-wt-gray-medium sm:text-xl">N/A</div>
        </ng-template>
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
