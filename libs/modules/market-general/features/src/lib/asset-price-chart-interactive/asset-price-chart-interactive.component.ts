import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarketApiService } from '@mm/api-client';
import { HistoricalPrice, SymbolHistoricalPeriods, SymbolHistoricalPeriodsArrayPreload } from '@mm/api-types';
import {
  AssetPriceChartComponent,
  DefaultImgDirective,
  RangeDirective,
  TimePeriodButtonsComponent,
} from '@mm/shared/ui';
import { catchError, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-asset-price-chart-interactive',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AssetPriceChartComponent,
    TimePeriodButtonsComponent,
    DefaultImgDirective,
    MatButtonModule,
    MatIconModule,
    RangeDirective,
  ],
  providers: [DatePipe],
  template: `
    @if (!errorLoadSignal() && !errorFromParent()) {
      @if (!loadingSignal()) {
        <!-- time period form control -->
        <div class="mb-4">
          <app-time-period-buttons [formControl]="timePeriodFormControl" />
        </div>

        <!-- time data about chart -->
        <div class="text-wt-gray-medium flex justify-between text-center">
          <div class="flex items-center gap-2">
            @if (imageName()) {
              <img appDefaultImg imageType="symbol" [src]="imageName()" alt="Asset Image" class="h-6 w-6" />
            }
            <span class="hidden sm:block">{{ title() }}</span>
            <span class="block sm:hidden">{{ symbol() }}</span>
          </div>
          <span class="block text-sm">
            {{ dateDisplay() }}
          </span>
        </div>

        <!-- price & volume chart -->
        <app-asset-price-chart
          [period]="timePeriodFormControl.value"
          [priceShowSign]="priceShowSign()"
          [priceName]="priceName()"
          [displayVolume]="displayVolume()"
          [historicalPrice]="stockHistoricalPriceSignal()"
          [heightPx]="chartHeightPx()"
        />
      } @else {
        <!-- time period button skeletons -->
        <div class="mb-4 hidden gap-3 md:flex">
          <div *ngRange="8" class="g-skeleton h-9 flex-1"></div>
        </div>

        <!-- skeleton on mobile -->
        <div class="g-skeleton mb-4 h-12 gap-3 rounded-lg md:hidden"></div>

        <!-- chart title and date range -->
        <div class="mb-3 flex justify-between">
          <div class="g-skeleton h-6 w-3/12 max-w-[150px]"></div>
          <div class="g-skeleton h-6 w-7/12 max-w-[350px]"></div>
        </div>

        <!-- chart skeleton -->
        <div [style.height.px]="chartHeightPx() - 35" class="g-skeleton"></div>
      }
    } @else {
      <!-- error loading -->
      <div class="bg-wt-gray-light-strong grid place-content-center gap-y-4" [style.height.px]="chartHeightPx() + 30">
        <div class="text-lg">Failed to load content</div>

        <!-- display reloading only if no error from parent -->
        @if (!errorFromParent()) {
          <button (click)="onRefresh()" type="button" mat-stroked-button color="warn">
            <mat-icon>refresh</mat-icon>
            try again
          </button>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetPriceChartInteractiveComponent implements OnInit {
  private readonly marketApiService = inject(MarketApiService);
  private readonly datePipe = inject(DatePipe);

  readonly symbol = input.required<string>();
  readonly chartHeightPx = input(420);
  readonly priceName = input('price');
  readonly priceShowSign = input(true);
  readonly title = input('Historical Prices');
  readonly imageName = input('');
  readonly displayVolume = input(true);

  /** parent can set that some error happened and no data will be loaded */
  readonly errorFromParent = input(false);

  readonly loadingSignal = signal<boolean>(true);
  readonly errorLoadSignal = signal<boolean>(false);

  readonly stockHistoricalPriceSignal = signal<HistoricalPrice[]>([]);

  readonly timePeriodFormControl = new FormControl<SymbolHistoricalPeriods>(SymbolHistoricalPeriods.week, {
    nonNullable: true,
  });

  readonly dateDisplay = computed(() => {
    const stockHistorical = this.stockHistoricalPriceSignal();
    if (stockHistorical.length === 0) {
      return '';
    }
    const start = this.datePipe.transform(stockHistorical[0].date, 'MMM d, y');
    const end = this.datePipe.transform(stockHistorical[stockHistorical.length - 1].date, 'MMM d, y');

    return `${start} - ${end}`;
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
