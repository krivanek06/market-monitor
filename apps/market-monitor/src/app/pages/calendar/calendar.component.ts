import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MarketApiService } from '@market-monitor/api-client';
import {
  CalendarAssetDataTypes,
  CalendarDividend,
  CalendarStockEarning,
  resolveCalendarType,
} from '@market-monitor/api-types';
import { DividendItemComponent, DividendItemsDialogComponent } from '@market-monitor/modules/market-dividends';
import {
  EarningsHistoricalDialogComponent,
  EarningsItemComponent,
  EarningsItemsDialogComponent,
} from '@market-monitor/modules/market-earnings';
import { CalendarRange, CalendarWrapperComponent, MarkerDirective } from '@market-monitor/shared-components';
import { RangeDirective } from '@market-monitor/shared-directives';
import { SCREEN_DIALOGS } from '@market-monitor/shared-utils-client';
import {
  fillOutMissingDatesForMonth,
  generateDatesArray,
  groupValuesByDate,
} from '@market-monitor/shared-utils-general';
import { Observable, combineLatest, map, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-calendar',
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
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  marketApiService = inject(MarketApiService);
  dialog = inject(MatDialog);

  currentDateRangeControl = new FormControl<CalendarRange>(
    {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
    { nonNullable: true }
  );

  displayElements = 5;

  calendarTypeInputSource = [
    { value: 'dividends', caption: 'Dividends' },
    { value: 'earnings', caption: 'Earnings' },
  ] as const;

  calendarTypeFormControl = new FormControl<(typeof this.calendarTypeInputSource)[number]>(
    this.calendarTypeInputSource[0],
    { nonNullable: true }
  );

  loadingSignal = signal<boolean>(true);
  datesInMonthSignal = toSignal(
    this.currentDateRangeControl.valueChanges.pipe(
      startWith(this.currentDateRangeControl.value),
      map((d) => generateDatesArray(d).length)
    )
  );

  calendarDataDividendSignal = computed(() =>
    resolveCalendarType<CalendarDividend>(this.calendarDataSignal(), 'dividend')
  );
  calendarDataEarningsSignal = computed(() =>
    resolveCalendarType<CalendarStockEarning>(this.calendarDataSignal(), 'eps')
  );

  onMoreDividends(data: CalendarDividend[]): void {
    this.dialog.open(DividendItemsDialogComponent, {
      data: {
        dividends: data,
        showDate: true,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  onMoreEarnings(data: CalendarStockEarning[]): void {
    this.dialog.open(EarningsItemsDialogComponent, {
      data: {
        earnings: data,
        showDate: true,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  onEarningsClicked(data: CalendarStockEarning | null): void {
    this.dialog.open(EarningsHistoricalDialogComponent, {
      data: {},
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  private calendarDataSignal = toSignal(
    combineLatest([
      this.currentDateRangeControl.valueChanges.pipe(startWith(this.currentDateRangeControl.value)),
      this.calendarTypeFormControl.valueChanges.pipe(startWith(this.calendarTypeFormControl.value)),
    ]).pipe(
      tap(() => this.loadingSignal.set(true)),
      switchMap(([dateRange, calendarType]) =>
        this.resolveCalendarAPICall(calendarType.value, dateRange.month, dateRange.year).pipe(
          map((res) => groupValuesByDate(res)),
          map((res) => fillOutMissingDatesForMonth(res))
        )
      ),
      tap((e) => {
        console.log(e);
        this.loadingSignal.set(false);
      })
    ),
    { initialValue: [] }
  );

  private resolveCalendarAPICall(
    type: (typeof this.calendarTypeInputSource)[number]['value'],
    month: number,
    year: number
  ): Observable<CalendarAssetDataTypes[]> {
    if (type === 'earnings') {
      return this.marketApiService.getMarketCalendarEarnings(month, year);
    }

    return this.marketApiService.getMarketCalendarDividends(month, year);
  }
}
