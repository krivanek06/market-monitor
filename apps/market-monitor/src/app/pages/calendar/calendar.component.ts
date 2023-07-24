import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
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
  StockSummaryDialogComponent,
} from '@market-monitor/modules/market-stocks';
import {
  CalendarRageToday,
  CalendarRange,
  CalendarWrapperComponent,
  MarkerDirective,
} from '@market-monitor/shared-components';
import { RangeDirective } from '@market-monitor/shared-directives';
import { DialogServiceModule, RouterManagement, SCREEN_DIALOGS } from '@market-monitor/shared-utils-client';
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
    StockSummaryDialogComponent,
    DialogServiceModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit, RouterManagement {
  marketApiService = inject(MarketApiService);
  dialog = inject(MatDialog);
  router = inject(Router);
  route = inject(ActivatedRoute);

  currentDateRangeControl = new FormControl<CalendarRange>(CalendarRageToday, { nonNullable: true });

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

  ngOnInit(): void {
    this.loadQueryParams();
  }

  private calendarDataSignal = toSignal(
    combineLatest([this.currentDateRangeControl.valueChanges, this.calendarTypeFormControl.valueChanges]).pipe(
      tap(([dateRange, calendarType]) => {
        this.loadingSignal.set(true);
        this.updateQueryParams(calendarType.value, dateRange);
      }),
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

  onEarningsClicked(data: CalendarStockEarning): void {
    this.dialog.open(EarningsHistoricalDialogComponent, {
      data: {
        symbol: data.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onDividendClick(data: CalendarDividend): void {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: data.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  loadQueryParams(): void {
    const type = this.route.snapshot.queryParams?.['type'];
    const year = Number(this.route.snapshot.queryParams?.['year']);
    const month = Number(this.route.snapshot.queryParams?.['month']);
    const selectedType = this.calendarTypeInputSource.find((e) => e.value === type);

    // all of them must be present
    if (!type || !selectedType || isNaN(year) || isNaN(month)) {
      // trigger value change for both
      this.calendarTypeFormControl.setValue(this.calendarTypeInputSource[0]);
      this.currentDateRangeControl.setValue(CalendarRageToday);
      return;
    }

    this.calendarTypeFormControl.setValue(selectedType);
    this.currentDateRangeControl.setValue({
      year,
      month,
    });
  }

  updateQueryParams(data: (typeof this.calendarTypeInputSource)[number]['value'], range: CalendarRange): void {
    this.router.navigate([], {
      queryParams: {
        type: data,
        month: range.month,
        year: range.year,
      },
      queryParamsHandling: 'merge',
    });
  }

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
