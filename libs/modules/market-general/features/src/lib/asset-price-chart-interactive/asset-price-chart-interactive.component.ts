import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarketApiService } from '@mm/api-client';
import { SymbolHistoricalPeriods } from '@mm/api-types';
import { AssetPriceChartComponent, DefaultImgDirective, TimePeriodButtonsComponent } from '@mm/shared/ui';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

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
  ],
  providers: [DatePipe],
  template: `
    <!-- time period form control -->
    <div class="mb-4">
      <app-time-period-buttons [formControl]="timePeriodFormControl" />
    </div>

    @if (stockHistoricalPrice().action === 'loaded') {
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
        [historicalPrice]="stockHistoricalPrice().data"
        [heightPx]="chartHeightPx()"
      />
    } @else if (stockHistoricalPrice().action === 'loading') {
      <!-- skeleton on mobile -->
      <div class="g-skeleton mb-4 h-12 gap-3 rounded-lg md:hidden"></div>

      <!-- chart title and date range -->
      <div class="mb-3 flex justify-between">
        <div class="g-skeleton h-6 w-3/12 max-w-[150px]"></div>
        <div class="g-skeleton h-6 w-7/12 max-w-[350px]"></div>
      </div>

      <!-- chart skeleton -->
      <div [style.height.px]="chartHeightPx() - 35" class="g-skeleton"></div>
    } @else {
      <!-- error state -->
      <div class="bg-wt-gray-light-strong grid place-content-center gap-y-4" [style.height.px]="chartHeightPx()">
        <div class="text-lg">Failed to load content</div>
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
export class AssetPriceChartInteractiveComponent {
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

  readonly timePeriodFormControl = new FormControl<SymbolHistoricalPeriods>(SymbolHistoricalPeriods.week, {
    nonNullable: true,
  });

  readonly stockHistoricalPrice = toSignal(
    this.timePeriodFormControl.valueChanges.pipe(
      switchMap((period) =>
        this.marketApiService.getHistoricalPrices(this.symbol(), period).pipe(
          map((data) => ({
            action: 'loaded' as const,
            data,
          })),
          startWith({
            data: [],
            action: 'loading' as const,
          }),
          catchError((err) => {
            console.log(err);
            return of({ data: [], action: 'error' as const });
          }),
        ),
      ),
    ),
    { initialValue: { data: [], action: 'loading' as const } },
  );

  readonly dateDisplay = computed(() => {
    const stockHistorical = this.stockHistoricalPrice();
    if (stockHistorical.action !== 'loaded' || stockHistorical.data.length === 0) {
      return '';
    }

    const start = this.datePipe.transform(stockHistorical.data[0].date, 'MMM d, y');
    const end = this.datePipe.transform(stockHistorical.data[stockHistorical.data.length - 1].date, 'MMM d, y');

    return `${start} - ${end}`;
  });

  readonly symbolChangeEffect = effect(() => {
    // on symbol change reset time period to default
    const symbol = this.symbol();
    this.timePeriodFormControl.setValue(SymbolHistoricalPeriods.week);
  });
}
