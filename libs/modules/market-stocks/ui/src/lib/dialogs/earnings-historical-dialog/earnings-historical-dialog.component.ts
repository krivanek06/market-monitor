import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { StocksApiService } from '@market-monitor/api-client';
import { EstimatedChartDataType } from '@market-monitor/shared/data-access';
import { DialogCloseHeaderComponent } from '@market-monitor/shared/ui';
import { map } from 'rxjs';
import { EarningsEstimationChartComponent, RevenueEstimationChartComponent } from '../../components';

@Component({
  selector: 'app-earnings-historical-dialog',
  standalone: true,
  imports: [
    CommonModule,
    EarningsEstimationChartComponent,
    MatDialogModule,
    DialogCloseHeaderComponent,
    RevenueEstimationChartComponent,
    MatRadioModule,
    ReactiveFormsModule,
  ],
  template: `
    <app-dialog-close-header [title]="'Earnings: ' + data.symbol"></app-dialog-close-header>

    <div class="flex items-center justify-between sm:pr-3 sm:pl-6">
      <h2>Beat: {{ beatings ?? 0 }} / {{ displayDataNumberSignal() }}</h2>
      <mat-radio-group
        [formControl]="selectedChartTypeControl"
        color="primary"
        aria-label="Select an option"
        class="flex justify-end gap-x-4"
      >
        <mat-radio-button value="earnings">Earnings</mat-radio-button>
        <mat-radio-button value="revenue">Revenue</mat-radio-button>
      </mat-radio-group>
    </div>

    <mat-dialog-content>
      <ng-container *ngIf="!isDataLoading()">
        <!-- earnings -->
        <ng-container *ngIf="isEarningsSelected">
          <app-earnings-estimation-chart
            *ngIf="stockEarningsEstimationSignal() as data"
            [heightPx]="500"
            [data]="data"
            [limitValues]="limitValues"
            [showTitle]="true"
          ></app-earnings-estimation-chart>
        </ng-container>

        <!-- revenue -->
        <ng-container *ngIf="isRevenueSelected">
          <app-revenue-estimation-chart
            *ngIf="stockRevenueEstimationSignal() as data"
            [heightPx]="500"
            [data]="data"
            [limitValues]="limitValues"
            [showTitle]="true"
          ></app-revenue-estimation-chart>
        </ng-container>
      </ng-container>

      <ng-container *ngIf="isDataLoading()">
        <div class="g-skeleton h-[500px] w-full mt-2"></div>
      </ng-container>
    </mat-dialog-content>
  `,
  styles: `
  :host {
    display: block;
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarningsHistoricalDialogComponent {
  selectedChartTypeControl = new FormControl<'earnings' | 'revenue'>('earnings');

  limitValues = 30;

  get isEarningsSelected(): boolean {
    return this.selectedChartTypeControl.value === 'earnings';
  }

  get isRevenueSelected(): boolean {
    return this.selectedChartTypeControl.value === 'revenue';
  }

  displayDataNumberSignal = computed(() =>
    this.stockEarningsEstimationSignal().length > this.limitValues
      ? this.limitValues
      : this.stockEarningsEstimationSignal()?.length,
  );

  isDataLoading = computed(
    () => this.stockEarningsEstimationSignal().length === 0 && this.stockRevenueEstimationSignal().length === 0,
  );

  get beatings(): number | undefined {
    if (!this.stockEarningsEstimationSignal() || !this.stockRevenueEstimationSignal()) {
      return 0;
    }

    const earnings = this.stockEarningsEstimationSignal()
      ?.slice(-this.limitValues)
      ?.reduce((acc, curr) => ((curr?.valueActual ?? -99) > (curr?.valueEst ?? -99) ? acc + 1 : acc), 0);

    const revenue = this.stockRevenueEstimationSignal()
      ?.slice(-this.limitValues)
      ?.reduce((acc, curr) => ((curr?.valueActual ?? -99) > (curr?.valueEst ?? -99) ? acc + 1 : acc), 0);

    return this.isEarningsSelected ? earnings : revenue;
  }

  stockEarningsEstimationSignal = toSignal(
    this.stocksApiService.getStockEarnings(this.data.symbol).pipe(
      map((earnings) =>
        earnings
          .map(
            (earning) =>
              ({
                date: earning.date,
                valueActual: earning.eps,
                valueEst: earning.epsEstimated,
              }) satisfies EstimatedChartDataType,
          )
          .reverse(),
      ),
    ),
    { initialValue: [] },
  );

  stockRevenueEstimationSignal = toSignal(
    this.stocksApiService.getStockEarnings(this.data.symbol).pipe(
      map((earnings) =>
        earnings
          .map(
            (earning) =>
              ({
                date: earning.date,
                valueActual: earning.revenue,
                valueEst: earning.revenueEstimated,
              }) satisfies EstimatedChartDataType,
          )
          .reverse(),
      ),
    ),
    { initialValue: [] },
  );

  constructor(
    private dialogRef: MatDialogRef<EarningsHistoricalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { symbol: string },
    private stocksApiService: StocksApiService,
  ) {
    this.selectedChartTypeControl.valueChanges.subscribe(console.log);
  }
}
