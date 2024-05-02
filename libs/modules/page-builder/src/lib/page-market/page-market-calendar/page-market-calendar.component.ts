import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketApiService } from '@mm/api-client';
import { CalendarAssetDataTypes, CalendarDividend, CalendarStockEarning } from '@mm/api-types';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import {
  DividendItemComponent,
  DividendItemsDialogComponent,
  EarningsHistoricalDialogComponent,
  EarningsItemComponent,
  EarningsItemsDialogComponent,
} from '@mm/market-stocks/ui';
import { InputSource, RouterManagement } from '@mm/shared/data-access';
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
    StockSummaryDialogComponent,
    MatDialogModule,
    DropdownControlComponent,
  ],
  template: `
    <div class="flex flex-col items-center justify-between gap-3 mb-10 md:flex-row sm:pl-4">
      <h2>Calendar type: {{ calendarTypeFormControl.value | titlecase }}</h2>

      <!-- calendar change select -->
      <app-dropdown-control
        class="min-w-[350px] max-md:w-full"
        inputCaption="Calendar Types"
        [formControl]="calendarTypeFormControl"
        [inputSource]="calendarTypeInputSource"
      />
    </div>

    <app-calendar-wrapper [formControl]="currentDateRangeControl">
      <ng-container *ngIf="!loadingSignal()">
        <!-- Dividends -->
        <ng-template marker *ngFor="let dividendsData of calendarDataDividendSignal()">
          <ng-container *ngFor="let data of dividendsData.data | slice: 0 : displayElements; let last = last">
            <app-dividend-item
              (itemClickedEmitter)="onDividendClick(data)"
              [showBorder]="!last"
              [dividend]="data"
            ></app-dividend-item>
          </ng-container>
          <!-- more button -->
          <div class="flex justify-end">
            <button
              *ngIf="dividendsData.data && dividendsData.data.length > displayElements"
              (click)="onMoreDividends(dividendsData.data)"
              mat-button
              type="button"
              color="primary"
            >
              {{ dividendsData.data.length - displayElements }} more
            </button>
          </div>
        </ng-template>

        <!-- Earnings -->
        <ng-template marker *ngFor="let earningsData of calendarDataEarningsSignal()">
          <ng-container *ngFor="let data of earningsData.data | slice: 0 : displayElements; let last = last">
            <app-earnings-item
              (itemClickedEmitter)="onEarningsClicked(data)"
              [showBorder]="!last"
              [earning]="data"
            ></app-earnings-item>
          </ng-container>
          <!-- more button -->
          <div class="flex justify-end">
            <button
              *ngIf="earningsData.data && earningsData.data.length > displayElements"
              (click)="onMoreEarnings(earningsData.data)"
              mat-button
              type="button"
              color="primary"
            >
              {{ earningsData.data.length - displayElements }} more
            </button>
          </div>
        </ng-template>
      </ng-container>

      <!-- loading skeletons -->
      <ng-container *ngIf="loadingSignal()">
        <ng-template marker *ngRange="datesInMonthSignal() ?? 0">
          <div *ngRange="displayElements" class="w-full h-10 mb-1 g-skeleton"></div>
        </ng-template>
      </ng-container>
    </app-calendar-wrapper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      @apply mt-10 block;
    }
  `,
})
export class PageMarketCalendarComponent implements OnInit, RouterManagement {
  marketApiService = inject(MarketApiService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  currentDateRangeControl = new FormControl<CalendarRange>(CalendarRageToday, { nonNullable: true });

  displayElements = 5;

  calendarTypeInputSource = [
    { value: 'dividends', caption: 'Dividends' },
    { value: 'earnings', caption: 'Earnings' },
  ] satisfies InputSource<string>[];

  calendarTypeFormControl = new FormControl<string>(this.calendarTypeInputSource[0].value, { nonNullable: true });

  loadingSignal = signal<boolean>(true);
  datesInMonthSignal = toSignal(
    this.currentDateRangeControl.valueChanges.pipe(
      startWith(this.currentDateRangeControl.value),
      map((d) => generateDatesArrayForMonth(d).length),
    ),
  );

  calendarDataDividendSignal = computed(() =>
    this.resolveCalendarType<CalendarDividend>(this.calendarDataSignal(), 'dividend'),
  );
  calendarDataEarningsSignal = computed(() =>
    this.resolveCalendarType<CalendarStockEarning>(this.calendarDataSignal(), 'eps'),
  );

  ngOnInit(): void {
    this.loadQueryParams();
  }

  private calendarDataSignal = toSignal(
    combineLatest([this.currentDateRangeControl.valueChanges, this.calendarTypeFormControl.valueChanges]).pipe(
      tap(([dateRange, calendarType]) => {
        this.loadingSignal.set(true);
        this.updateQueryParams(calendarType, dateRange);
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
        panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
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
        panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
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

  loadQueryParams(): void {
    const type = this.route.snapshot.queryParams?.['type'];
    const year = Number(this.route.snapshot.queryParams?.['year']);
    const month = Number(this.route.snapshot.queryParams?.['month']);
    const selectedType = this.calendarTypeInputSource.find((e) => e.value === type);

    // all of them must be present
    if (!type || !selectedType || isNaN(year) || isNaN(month)) {
      // trigger value change for both
      this.calendarTypeFormControl.setValue(this.calendarTypeInputSource[0].value);
      this.currentDateRangeControl.setValue(CalendarRageToday);
      return;
    }

    this.calendarTypeFormControl.setValue(selectedType.value);
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

  private showStockSummary(symbol: string): void {
    this.dialog.open(StockSummaryDialogComponent, {
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
