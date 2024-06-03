import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarketApiService } from '@mm/api-client';
import { HistoricalPrice, SymbolHistoricalPeriods, SymbolHistoricalPeriodsArrayPreload } from '@mm/api-types';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { AssetPriceChartComponent, DefaultImgDirective, TimePeriodButtonsComponent } from '@mm/shared/ui';
import { catchError, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-asset-price-chart-interactive',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AssetPriceChartComponent,
    TimePeriodButtonsComponent,
    DefaultImgDirective,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <!-- time period form control -->
    <div *ngIf="!errorLoadSignal()" class="mb-4">
      <app-time-period-buttons [formControl]="timePeriodFormControl"></app-time-period-buttons>
    </div>

    <ng-container *ngIf="!loadingSignal(); else chartSkeleton">
      <ng-container *ngIf="stockHistoricalPriceSignal() as historicalPrice">
        <ng-container *ngIf="!errorLoadSignal(); else errorLoading">
          <!-- time data about chart -->
          <div class="text-wt-gray-medium flex justify-end md:justify-between">
            <div class="hidden items-center gap-2 md:flex">
              <img
                *ngIf="imageName()"
                appDefaultImg
                imageType="symbol"
                [src]="imageName()"
                alt="Asset Image"
                class="h-6 w-6"
              />
              <span>{{ title() }}</span>
            </div>
            <span *ngIf="historicalPrice.length > 0" class="block">
              {{ historicalPrice[0].date | date: 'MMMM d, y' }} -
              {{ historicalPrice[historicalPrice.length - 1].date | date: 'MMMM d, y' }}
            </span>
          </div>

          <!-- price & volume chart -->
          <app-asset-price-chart
            [period]="timePeriodFormControl.value"
            [priceShowSign]="priceShowSign()"
            [priceName]="priceName()"
            [displayVolume]="displayVolume()"
            [historicalPrice]="historicalPrice"
            [heightPx]="chartHeightPx()"
          ></app-asset-price-chart>
        </ng-container>
      </ng-container>
    </ng-container>

    <!-- skeleton chart -->
    <ng-template #chartSkeleton>
      <!-- chart title() and date range -->
      <div class="mb-3 flex justify-end max-sm:pl-4 md:justify-between">
        <div class="g-skeleton h-6 sm:w-[125px]"></div>
        <div class="g-skeleton h-6 w-[350px]"></div>
      </div>

      <div [style.height.px]="chartHeightPx() - 25" class="g-skeleton"></div>
    </ng-template>

    <!-- error loading -->
    <ng-template #errorLoading>
      <div class="bg-wt-gray-light-strong grid place-content-center gap-y-4" [style.height.px]="chartHeightPx()">
        <div class="text-lg">Failed to load content</div>
        <button (click)="onRefresh()" type="button" mat-stroked-button color="warn">
          <mat-icon>refresh</mat-icon>
          try again
        </button>
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
export class AssetPriceChartInteractiveComponent implements OnInit {
  symbol = input.required<string>();
  chartHeightPx = input(420);
  priceName = input('price');
  priceShowSign = input(true);
  title = input('Historical Prices');
  imageName = input('');
  displayVolume = input(true);

  loadingSignal = signal<boolean>(true);
  errorLoadSignal = signal<boolean>(false);

  stockHistoricalPriceSignal = signal<HistoricalPrice[]>([]);

  marketApiService = inject(MarketApiService);
  dialogServiceUtil = inject(DialogServiceUtil);
  timePeriodFormControl = new FormControl<SymbolHistoricalPeriods>(SymbolHistoricalPeriods.week, {
    nonNullable: true,
  });

  ngOnInit(): void {
    // load prices by selected time period
    this.timePeriodFormControl.valueChanges
      .pipe(
        startWith(this.timePeriodFormControl.value),
        tap(() => this.stockHistoricalPriceSignal.set([])),
        tap(() => this.loadingSignal.set(true)),
        switchMap((period) =>
          this.marketApiService.getHistoricalPrices(this.symbol(), period).pipe(
            tap(() => {
              this.errorLoadSignal.set(false);
              this.loadingSignal.set(false);
            }),
            catchError((err) => {
              console.log(err);
              this.errorLoadSignal.set(true);
              this.loadingSignal.set(false);
              return [];
            }),
          ),
        ),
      )
      .subscribe((prices) => {
        this.stockHistoricalPriceSignal.set(prices);
      });

    // preload some data for faster interaction
    SymbolHistoricalPeriodsArrayPreload.forEach((period) => {
      this.marketApiService.getHistoricalPrices(this.symbol(), period).subscribe(() => {
        console.log(`Preloaded ${this.symbol()} ${period}`);
      });
    });
  }

  symbolChangeEffect = effect(() => {
    const symbol = this.symbol();
    this.timePeriodFormControl.setValue(SymbolHistoricalPeriods.week);
  });

  onRefresh(): void {
    // trigger time period selection to load prices
    this.timePeriodFormControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }
}
