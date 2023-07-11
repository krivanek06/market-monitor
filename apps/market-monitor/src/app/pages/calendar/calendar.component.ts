import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MarketApiService } from '@market-monitor/api-client';
import { DividendItemComponent } from '@market-monitor/modules/market-dividends';
import { CalendarRange, CalendarWrapperComponent, MarkerDirective } from '@market-monitor/shared-components';
import { RangeDirective } from '@market-monitor/shared-directives';
import {
  fillOutMissingDatesForMonth,
  generateDatesArray,
  groupValuesByDate,
} from '@market-monitor/shared-utils-general';
import { map, startWith, switchMap, tap } from 'rxjs';

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
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  marketApiService = inject(MarketApiService);
  currentDateRangeControl = new FormControl<CalendarRange>(
    {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
    { nonNullable: true }
  );

  loadingSignal = signal<boolean>(true);
  datesInMonthSignal = toSignal(
    this.currentDateRangeControl.valueChanges.pipe(
      startWith(this.currentDateRangeControl.value),
      map((d) => generateDatesArray(d).length)
    )
  );
  calendarDividendsSignal = toSignal(
    this.currentDateRangeControl.valueChanges.pipe(
      startWith(this.currentDateRangeControl.value),
      tap(() => this.loadingSignal.set(true)),
      switchMap((dateRange) =>
        this.marketApiService.getMarketCalendarDividends(dateRange.month, dateRange.year).pipe(
          map((res) => groupValuesByDate(res)),
          map((res) => fillOutMissingDatesForMonth(res))
        )
      ),
      tap((e) => {
        console.log(e);
        this.loadingSignal.set(false);
      })
    )
  );
}
