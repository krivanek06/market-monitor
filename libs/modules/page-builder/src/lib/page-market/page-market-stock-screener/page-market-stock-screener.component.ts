import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MarketApiService } from '@mm/api-client';
import { StockScreenerValues, SymbolQuote } from '@mm/api-types';
import { STOCK_SCREENER_DEFAULT_VALUES } from '@mm/market-stocks/data-access';
import { SymbolSearchBasicComponent, SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import { StockScreenerFormControlComponent, StockSummaryTableComponent } from '@mm/market-stocks/ui';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { RangeDirective, ScrollNearEndDirective, SectionTitleComponent } from '@mm/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { BehaviorSubject, catchError, exhaustMap, map, of, scan, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-page-market-stock-screener',
  standalone: true,
  imports: [
    CommonModule,
    StockScreenerFormControlComponent,
    ReactiveFormsModule,
    StockSummaryTableComponent,
    RangeDirective,
    ScrollNearEndDirective,
    MatDialogModule,
    MatButtonModule,
    MatDialogModule,
    SymbolSearchBasicComponent,
    MatDividerModule,
    SectionTitleComponent,
  ],
  template: `
    <section class="mx-auto mb-10 md:w-11/12 md:pt-4 lg:w-10/12 xl:w-9/12">
      <!-- specific search -->
      <div class="mb-4 md:hidden">
        <app-section-title title="Basic Search" matIcon="search" class="mb-3" />
        <app-symbol-search-basic />

        <div class="pt-4">
          <mat-divider />
        </div>
      </div>

      <!-- screener form -->
      <div>
        <app-section-title title="Advance Search" matIcon="filter_alt" class="mb-3" />
        <app-stock-screener-form-control [formControl]="screenerFormControl" />
      </div>

      <div class="mt-8 flex items-center justify-between">
        <h3>Total found: {{ screenerResults().isLoading ? 'Loading...' : screenerResults().total }}</h3>

        <button (click)="onFormReset()" mat-stroked-button color="warn" class="g-border-apply">Reset Form</button>
      </div>
    </section>

    <!-- table of results -->
    <app-stock-summary-table
      appScrollNearEnd
      (nearEndEmitter)="onNearEnd()"
      (itemClickedEmitter)="onQuoteClick($event)"
      [symbolQuotes]="screenerResults().data"
      [showLoadingSkeletonManual]="screenerResults().isLoading"
      [symbolSkeletonLoaders]="screenerDefault"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PageMarketStockScreenerComponent {
  readonly screenerDefault = 30;
  private readonly marketApiService = inject(MarketApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly dialog = inject(MatDialog);

  readonly screenerFormControl = new FormControl<StockScreenerValues | null>(null);

  /**
   * will emit incremented number every time user scrolls near end
   */
  readonly displayItems$ = new BehaviorSubject<[number, number]>([0, this.screenerDefault]);
  readonly screenerResults = toSignal(
    this.screenerFormControl.valueChanges.pipe(
      // start with the current value
      startWith(STOCK_SCREENER_DEFAULT_VALUES),
      // filter out null values
      filterNil(),
      // reset display items on form change
      tap(() => this.displayItems$.next([0, this.screenerDefault])),
      switchMap((screenerForm) =>
        this.marketApiService.getStockScreening(screenerForm).pipe(
          switchMap((screenerResults) =>
            this.displayItems$.pipe(
              map((displayItemsLimit) => {
                const [start, end] = displayItemsLimit;

                // no more results
                if (screenerResults.length < start) {
                  return [];
                }

                // only a few results left
                if (screenerResults.length < end) {
                  return screenerResults.slice(start);
                }

                // return the next batch
                return screenerResults.slice(start, end);
              }),
              // get the symbols
              map((batch) => batch.map((quote) => quote.symbol)),
              // load quote data from API
              exhaustMap((symbols) =>
                this.marketApiService.getSymbolQuotes(symbols).pipe(
                  map((quotes) => ({
                    total: screenerResults.length,
                    data: quotes,
                    isLoading: false as const,
                  })),
                  // display loading screen when loading more quotes
                  startWith({ data: [], total: screenerResults.length, isLoading: true as const }),
                  catchError((err) => {
                    this.dialogServiceUtil.handleError(err);
                    return of({ data: [], total: 0, isLoading: false as const });
                  }),
                ),
              ),
            ),
          ),
          scan(
            (acc, data) => ({
              data: [...acc.data, ...data.data],
              isLoading: data.isLoading,
              total: data.total,
            }),
            {
              total: 0,
              data: [] as SymbolQuote[],
              isLoading: false,
            },
          ),
          // display loading screen on form change
          startWith({ data: [], total: 0, isLoading: true as const }),
        ),
      ),
    ),
    { initialValue: { data: [], total: 0, isLoading: true } },
  );

  onFormReset(): void {
    this.screenerFormControl.reset(null);
  }

  onQuoteClick(summary: SymbolQuote): void {
    this.dialog.open(SymbolSummaryDialogComponent, {
      data: {
        symbol: summary.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onNearEnd() {
    const prev = this.displayItems$.value[1];
    this.displayItems$.next([prev, prev + this.screenerDefault]);
  }
}
