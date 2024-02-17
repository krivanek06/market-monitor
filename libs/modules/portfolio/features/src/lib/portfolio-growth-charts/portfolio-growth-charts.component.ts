import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PortfolioGrowthAssets, PortfolioState } from '@market-monitor/api-types';
import { PortfolioGrowth } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioAssetChartComponent,
  PortfolioChangeChartComponent,
  PortfolioGrowthChartComponent,
} from '@market-monitor/modules/portfolio/ui';
import { DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  FormMatInputWrapperComponent,
  SectionTitleComponent,
  filterDataByDateRange,
} from '@market-monitor/shared/ui';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

@Component({
  selector: 'app-portfolio-growth-charts',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioAssetChartComponent,
    DateRangeSliderComponent,
    FormMatInputWrapperComponent,
    PortfolioChangeChartComponent,
    ReactiveFormsModule,
    PortfolioGrowthChartComponent,
    SectionTitleComponent,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <!-- portfolio growth -->
    <div class="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
      <!-- select chart title -->
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <app-section-title title="Portfolio Growth" class="mr-6 max-lg:flex-1" />
        <button
          (click)="onPortfolioChangeChart()"
          matTooltip="Display daily portfolio change - profit/loss"
          type="button"
          class="hidden sm:block"
          mat-stroked-button
        >
          Portfolio Change
        </button>
        <button
          (click)="onAssetGrowthChart()"
          matTooltip="Display invested amount per asset in your portfolio"
          type="button"
          class="hidden sm:block"
          mat-stroked-button
        >
          Asset Growth
        </button>
      </div>

      <!-- date range -->
      <app-date-range-slider
        class="w-full lg:w-[550px]"
        [formControl]="portfolioGrowthRangeControl"
      ></app-date-range-slider>
    </div>

    <app-portfolio-growth-chart
      *ngIf="portfolioGrowthChartSignal() as portfolioGrowthChartSignal"
      [data]="{
        values: portfolioGrowthChartSignal,
        startingCashValue: portfolioState?.startingCash ?? 0
      }"
      [displayHeader]="false"
      [heightPx]="heightPx"
      chartType="balance"
    ></app-portfolio-growth-chart>

    <!-- investment growth -->
    <app-portfolio-growth-chart
      *ngIf="portfolioInvestedChartSignal() as portfolioGrowthChartSignal"
      headerTitle="Invested Value to Market"
      [displayHeader]="true"
      [data]="{
        values: portfolioGrowthChartSignal,
        startingCashValue: portfolioState?.startingCash ?? 0
      }"
      [heightPx]="heightPx"
      chartType="marketValue"
    ></app-portfolio-growth-chart>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGrowthChartsComponent {
  @Input() showChartChangeSelect = false;
  @Input() heightPx = 400;
  @Input({ required: true }) portfolioState?: PortfolioState;
  @Input({ required: true }) portfolioAssetsGrowth!: PortfolioGrowthAssets[];
  @Input({ required: true }) set portfolioGrowth(data: PortfolioGrowth[]) {
    this.portfolioGrowth$.next(data);

    const sliderValues: DateRangeSliderValues = {
      dates: data.map((point) => point.date),
      currentMinDateIndex: 0,
      currentMaxDateIndex: data.length - 1,
    };

    // patch values only if empty
    if ((this.portfolioGrowthRangeControl.value?.dates?.length ?? 0) === 0) {
      this.portfolioGrowthRangeControl.patchValue(sliderValues);
    }
  }
  private portfolioGrowth$ = new BehaviorSubject<PortfolioGrowth[]>([]);
  private dialogServiceUtil = inject(DialogServiceUtil);

  portfolioGrowthRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  portfolioGrowthChartSignal = toSignal(
    combineLatest([this.portfolioGrowthRangeControl.valueChanges.pipe(startWith(null)), this.portfolioGrowth$]).pipe(
      map(([dateRange, data]) => filterDataByDateRange(data, dateRange)),
    ),
    { initialValue: [] },
  );
  portfolioInvestedChartSignal = toSignal(this.portfolioGrowth$);

  onPortfolioChangeChart(): void {
    const data = this.portfolioGrowth$.getValue();
    this.dialogServiceUtil.showGenericDialog({
      component: PortfolioChangeChartComponent,
      componentData: {
        data: data,
      },
    });
  }

  onAssetGrowthChart(): void {
    this.dialogServiceUtil.showGenericDialog({
      title: 'Portfolio Asset Growth Chart',
      component: PortfolioAssetChartComponent,
      componentData: {
        data: this.portfolioAssetsGrowth,
      },
    });
  }
}
