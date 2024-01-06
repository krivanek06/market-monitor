import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PortfolioGrowthAssets, PortfolioState } from '@market-monitor/api-types';
import { PortfolioGrowth, dashboardChartOptionsInputSource } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioAssetChartComponent,
  PortfolioChangeChartComponent,
  PortfolioGrowthChartComponent,
} from '@market-monitor/modules/portfolio/ui';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  FormMatInputWrapperComponent,
} from '@market-monitor/shared/ui';
import { addDays, isAfter, isBefore, subDays } from 'date-fns';
import { Subject, combineLatest, map, startWith } from 'rxjs';

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
  ],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <!-- select chart title -->
        <div *ngIf="showChartChangeSelect" class="text-lg text-wt-primary">
          {{ selectedChartFormControl.value.caption }}
        </div>
        <!-- date range -->
        <app-date-range-slider
          *ngIf="selectedChartFormControl.value.value !== 'PortfolioAssets'"
          class="w-[550px]"
          [displayUpperDate]="false"
          [formControl]="portfolioRangeControl"
        ></app-date-range-slider>
      </div>

      <!-- select chart type -->
      <app-form-mat-input-wrapper
        *ngIf="showChartChangeSelect"
        class="w-[350px]"
        [formControl]="selectedChartFormControl"
        inputCaption="Select Portfolio Type"
        inputType="SELECT"
        [inputSource]="dashboardChartOptionsInputSource"
      ></app-form-mat-input-wrapper>
    </div>

    <!-- portfolio growth -->
    <ng-container *ngIf="selectedChartFormControl.value.value === 'PortfolioGrowth'">
      <app-portfolio-growth-chart
        *ngIf="portfolioGrowthChartSignal() as portfolioGrowthChartSignal"
        [data]="{
          values: portfolioGrowthChartSignal,
          startingCashValue: portfolioState.startingCash
        }"
        [heightPx]="heightPx"
      ></app-portfolio-growth-chart>
    </ng-container>

    <!-- portfolio change -->
    <ng-container *ngIf="selectedChartFormControl.value.value === 'PortfolioChange'">
      <app-portfolio-change-chart
        *ngIf="portfolioChangeChartSignal() as portfolioChangeChartSignal"
        [data]="portfolioChangeChartSignal"
        [heightPx]="heightPx"
      ></app-portfolio-change-chart>
    </ng-container>

    <!-- portfolio assets -->
    <ng-container *ngIf="selectedChartFormControl.value.value === 'PortfolioAssets'">
      <app-portfolio-asset-chart [data]="portfolioAssetsGrowth" [heightPx]="heightPx"></app-portfolio-asset-chart>
    </ng-container>
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
  @Input() heightPx = 500;
  @Input({ required: true }) portfolioState!: PortfolioState;
  @Input({ required: true }) portfolioAssetsGrowth!: PortfolioGrowthAssets[];
  @Input({ required: true }) set portfolioGrowth(data: PortfolioGrowth[]) {
    this.portfolioGrowth$.next(data);

    const sliderValues: DateRangeSliderValues = {
      dates: data.map((point) => point.date),
      currentMinDateIndex: 0,
      currentMaxDateIndex: data.length - 1,
    };
    this.portfolioRangeControl.patchValue(sliderValues);
  }
  private portfolioGrowth$ = new Subject<PortfolioGrowth[]>();

  dashboardChartOptionsInputSource = dashboardChartOptionsInputSource;

  selectedChartFormControl = new FormControl(dashboardChartOptionsInputSource[0].value, { nonNullable: true });
  portfolioRangeControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  portfolioGrowthChartSignal = toSignal(
    combineLatest([this.portfolioRangeControl.valueChanges.pipe(startWith(null)), this.portfolioGrowth$]).pipe(
      map(([dateRange, data]) => this.filterDataByDateRange(data, dateRange)),
    ),
  );
  portfolioChangeChartSignal = toSignal(
    combineLatest([this.portfolioRangeControl.valueChanges.pipe(startWith(null)), this.portfolioGrowth$]).pipe(
      map(([dateRange, data]) => this.filterDataByDateRange(data, dateRange)),
    ),
  );

  private filterDataByDateRange(data: PortfolioGrowth[], dateRange: DateRangeSliderValues | null): PortfolioGrowth[] {
    if (!dateRange) {
      return data;
    }
    return data.filter(
      (d) =>
        isBefore(subDays(new Date(d.date), 1), new Date(dateRange.dates[dateRange.currentMaxDateIndex])) &&
        isAfter(addDays(new Date(d.date), 1), new Date(dateRange.dates[dateRange.currentMinDateIndex])),
    );
  }
}
