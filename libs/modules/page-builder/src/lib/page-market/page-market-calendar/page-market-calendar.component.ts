import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MarketApiService } from '@mm/api-client';
import { CalendarAssetDataTypes, CalendarDividend, CalendarStockEarning } from '@mm/api-types';
import { SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import {
  DividendItemComponent,
  DividendItemsDialogComponent,
  EarningsHistoricalDialogComponent,
  EarningsItemComponent,
  EarningsItemsDialogComponent,
} from '@mm/market-stocks/ui';
import { InputSource } from '@mm/shared/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { fillOutMissingDatesForMonth, generateDatesArrayForMonth, groupValuesByDate } from '@mm/shared/general-util';
import {
  CalendarRageToday,
  CalendarRange,
  CalendarWrapperComponent,
  DropdownControlComponent,
  MarkerDirective,
  RangeDirective,
} from '@mm/shared/ui';
import { Observable, combineLatest, filter, map, startWith, switchMap, take, tap } from 'rxjs';

@Component({
  selector: 'app-page-market-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarWrapperComponent,
    MarkerDirective,
    ReactiveFormsModule,
    DividendItemComponent,
    RangeDirective,
    MatSelectModule,
    MatFormFieldModule,
    EarningsItemComponent,
    MatButtonModule,
    DividendItemsDialogComponent,
    MatDialogModule,
    EarningsItemsDialogComponent,
    EarningsHistoricalDialogComponent,
    SymbolSummaryDialogComponent,
    MatDialogModule,
    DropdownControlComponent,
  ],
  template: `
    <div class="mb-10 flex flex-col items-center justify-between gap-3 sm:pl-4 md:flex-row">
      <h2 class="text-lg">
        Calendar type:
        <span class="text-wt-primary">{{ calendarTypeFormControl.value | titlecase }}</span>
      </h2>

      <!-- calendar change select -->
      <app-dropdown-control
        class="min-w-[350px] max-md:w-full"
        inputCaption="Calendar Types"
        [formControl]="calendarTypeFormControl"
        [inputSource]="calendarTypeInputSource"
      />
    </div>

    <app-calendar-wrapper [formControl]="currentDateRangeControl">
      @if (!loadingSignal()) {
        <!-- Dividends -->
        @for (dividendsData of calendarDataDividendSignal(); track dividendsData.date) {
          <ng-template marker>
            @for (data of dividendsData.data | slice: 0 : displayElements; track $index; let last = $last) {
              <app-dividend-item (itemClickedEmitter)="onDividendClick(data)" [showBorder]="!last" [dividend]="data" />
            }

            <!-- more button -->
            <div class="flex justify-end">
              @if (dividendsData.data && dividendsData.data.length > displayElements) {
                <button (click)="onMoreDividends(dividendsData.data)" mat-button type="button" color="primary">
                  {{ dividendsData.data.length - displayElements }} more
                </button>
              }
            </div>
          </ng-template>
        }

        <!-- Earnings -->
        @for (earningsData of calendarDataEarningsSignal(); track earningsData.date) {
          <ng-template marker>
            @for (data of earningsData.data | slice: 0 : displayElements; track $index; let last = $last) {
              <app-earnings-item (itemClickedEmitter)="onEarningsClicked(data)" [showBorder]="!last" [earning]="data" />
            }
            <!-- more button -->
            <div class="flex justify-end">
              @if (earningsData.data && earningsData.data.length > displayElements) {
                <button (click)="onMoreEarnings(earningsData.data)" mat-button type="button" color="primary">
                  {{ earningsData.data.length - displayElements }} more
                </button>
              }
            </div>
          </ng-template>
        }
      } @else {
        <!-- loading skeletons -->
        <ng-template marker *ngRange="datesInMonthSignal() ?? 0">
          <div *ngRange="displayElements" class="g-skeleton mb-1 h-10 w-full"></div>
        </ng-template>
      }
    </app-calendar-wrapper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PageMarketCalendarComponent {
  private readonly marketApiService = inject(MarketApiService);
  private readonly dialog = inject(MatDialog);

  readonly currentDateRangeControl = new FormControl<CalendarRange>(CalendarRageToday, { nonNullable: true });

  readonly displayElements = 5;

  readonly calendarTypeInputSource = [
    { value: 'dividends', caption: 'Dividends' },
    { value: 'earnings', caption: 'Earnings' },
  ] satisfies InputSource<string>[];

  readonly calendarTypeFormControl = new FormControl<string>(this.calendarTypeInputSource[0].value, {
    nonNullable: true,
  });

  readonly loadingSignal = signal<boolean>(true);
  readonly datesInMonthSignal = toSignal(
    this.currentDateRangeControl.valueChanges.pipe(
      startWith(this.currentDateRangeControl.value),
      map((d) => generateDatesArrayForMonth(d).length),
    ),
  );

  readonly calendarDataDividendSignal = computed(() =>
    this.resolveCalendarType<CalendarDividend>(this.calendarDataSignal(), 'dividend'),
  );
  readonly calendarDataEarningsSignal = computed(() =>
    this.resolveCalendarType<CalendarStockEarning>(this.calendarDataSignal(), 'eps'),
  );
  private readonly calendarDataSignal = toSignal(
    combineLatest([
      this.currentDateRangeControl.valueChanges.pipe(startWith(this.currentDateRangeControl.value)),
      this.calendarTypeFormControl.valueChanges.pipe(startWith(this.calendarTypeFormControl.value)),
    ]).pipe(
      tap(() => {
        this.loadingSignal.set(true);
      }),
      switchMap(([dateRange, calendarType]) =>
        this.resolveCalendarAPICall(calendarType, dateRange.month, dateRange.year).pipe(
          map((res) => groupValuesByDate(res)),
          map((res) => fillOutMissingDatesForMonth(res)),
        ),
      ),
      tap(() => this.loadingSignal.set(false)),
    ),
    { initialValue: [] },
  );

  onMoreDividends(data: CalendarDividend[]): void {
    this.dialog
      .open(DividendItemsDialogComponent, {
        data: {
          dividends: data,
          showDate: true,
        },
        panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
      })
      .afterClosed()
      .pipe(
        map((res) => res?.['dividend']),
        filter((res): res is CalendarDividend => !!res),
        tap((res) => this.showStockSummary(res.symbol)),
        take(1),
      )
      .subscribe();
  }

  onMoreEarnings(data: CalendarStockEarning[]): void {
    this.dialog
      .open(EarningsItemsDialogComponent, {
        data: {
          earnings: data,
          showDate: true,
        },
        panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
      })
      .afterClosed()
      .pipe(
        map((res) => res?.['earning']),
        filter((res): res is CalendarStockEarning => !!res),
        tap((res) => this.onEarningsClicked(res)),
        take(1),
      )
      .subscribe();
  }

  onEarningsClicked(data: CalendarStockEarning): void {
    this.dialog.open(EarningsHistoricalDialogComponent, {
      data: {
        symbol: data.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onDividendClick(data: CalendarDividend): void {
    this.showStockSummary(data.symbol);
  }

  private showStockSummary(symbol: string): void {
    this.dialog.open(SymbolSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  /**
   * based on the provided type T it will resolve to correct TS type
   *
   * @param data
   * @param objectKey
   * @returns
   */
  private resolveCalendarType = <T extends CalendarAssetDataTypes>(
    data: {
      data: CalendarAssetDataTypes[] | null;
      date: string;
    }[],
    objectKey: keyof T,
  ): {
    data: T[] | null;
    date: string;
  }[] => {
    const existingData = data.filter((item) => item.data && item.data.length > 0)[0];

    if (!existingData) {
      return [];
    }

    const isResolve =
      existingData.data && // null or array
      !!existingData.data[0] && // length of array > 0
      objectKey in existingData.data[0];

    return isResolve
      ? (data as {
          data: T[];
          date: string;
        }[])
      : [];
  };

  private resolveCalendarAPICall(
    type: (typeof this.calendarTypeInputSource)[number]['value'],
    month: number,
    year: number,
  ): Observable<CalendarAssetDataTypes[]> {
    if (type === 'earnings') {
      return this.marketApiService.getMarketCalendarEarnings(month, year);
    }

    return this.marketApiService.getMarketCalendarDividends(month, year);
  }
}
