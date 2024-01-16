import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
  ],
  template: `
    <!-- portfolio growth -->
    <div class="flex items-center justify-between">
      <!-- select chart title -->
      <div class="flex items-center gap-4">
        <app-section-title title="Portfolio Growth" class="mr-6" />
        <button (click)="onPortfolioChangeChart()" type="button" mat-stroked-button>Portfolio Change Chart</button>
        <button (click)="onAssetGrowthChart()" type="button" mat-stroked-button>Asset Growth Chart</button>
      </div>

      <!-- date range -->
      <app-date-range-slider
        class="w-[550px]"
        [displayUpperDate]="false"
        [formControl]="portfolioGrowthRangeControl"
      ></app-date-range-slider>
    </div>

    <app-portfolio-growth-chart
      *ngIf="portfolioGrowthChartSignal() as portfolioGrowthChartSignal"
      [data]="{
        values: portfolioGrowthChartSignal,
        startingCashValue: portfolioState.startingCash
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
        startingCashValue: portfolioState.startingCash
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
  @Input({ required: true }) portfolioState!: PortfolioState;
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
