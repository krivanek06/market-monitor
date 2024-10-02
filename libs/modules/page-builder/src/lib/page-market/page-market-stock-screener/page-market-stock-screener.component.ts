import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketApiService } from '@mm/api-client';
import { StockScreenerValues, SymbolQuote } from '@mm/api-types';
import {
  STOCK_SCREENER_DEFAULT_VALUES,
  getScreenerInputIndexByKey,
  getScreenerInputValueByKey,
} from '@mm/market-stocks/data-access';
import { SymbolSearchBasicComponent, SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import { StockScreenerFormControlComponent, StockSummaryTableComponent } from '@mm/market-stocks/ui';
import { RouterManagement } from '@mm/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { RangeDirective, ScrollNearEndDirective, SectionTitleComponent } from '@mm/shared/ui';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';

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
        <h3>Total found: {{ screenerResults().isLoading ? 'Loading...' : screenerResults().data.length }}</h3>

        <button (click)="onFormReset()" mat-stroked-button color="warn" class="g-border-apply">Reset Form</button>
      </div>
    </section>

    <!-- table of results -->
    @if (!screenerResults().isLoading) {
      <section class="mt-6">
        <app-stock-summary-table
          appScrollNearEnd
          [(nearEnd)]="maxScreenerResults"
          (itemClickedEmitter)="onQuoteClick($event)"
          [symbolQuotes]="screenerResults().data | slice: 0 : maxScreenerResults() * screenerDefault"
        />
      </section>
    } @else {
      <!-- loading screen -->
      <div class="mt-12">
        <div *ngRange="20" class="g-skeleton mb-1 h-14"></div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PageMarketStockScreenerComponent implements OnInit, RouterManagement {
  readonly screenerDefault = 30;
  private readonly marketApiService = inject(MarketApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly screenerFormControl = new FormControl<StockScreenerValues>(STOCK_SCREENER_DEFAULT_VALUES, {
    nonNullable: true,
  });

  /**
   * will emit incremented number every time user scrolls near end
   */
  readonly maxScreenerResults = signal(1);
  readonly screenerResults = toSignal(
    this.screenerFormControl.valueChanges.pipe(
      tap((formValue) => {
        // set max results to 1
        this.maxScreenerResults.set(1);
        // update url
        this.updateQueryParams(formValue);
      }),
      switchMap((values) =>
        this.marketApiService.getStockScreening(values).pipe(
          map((data) => ({
            data: data,
            isLoading: false,
          })),
          startWith({ data: [], isLoading: true }),
        ),
      ),
      catchError(() => {
        this.dialogServiceUtil.showNotificationBar('Error loading screener results', 'error');
        return of({ data: [], isLoading: false });
      }),
    ),
    { initialValue: { data: [], isLoading: true } },
  );

  ngOnInit(): void {
    this.loadQueryParams();
  }

  onFormReset(): void {
    this.screenerFormControl.reset(STOCK_SCREENER_DEFAULT_VALUES);
  }

  onQuoteClick(summary: SymbolQuote): void {
    this.dialog.open(SymbolSummaryDialogComponent, {
      data: {
        symbol: summary.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  /**
   * method triggers the this.screenerFormControl.valueChanges observable
   */
  loadQueryParams(): void {
    const queryParamSection = this.route.snapshot.queryParams?.['sections'];
    if (queryParamSection) {
      const sections = queryParamSection.split('_') as string[];
      const formValue = sections.reduce((acc, section) => {
        const [key, valueIndex] = section.split(':') as [keyof StockScreenerValues, string];
        const value = getScreenerInputValueByKey(key, Number(valueIndex));

        return { ...acc, [key]: value };
      }, {} as StockScreenerValues);

      this.screenerFormControl.setValue(formValue);
    } else {
      this.screenerFormControl.setValue(STOCK_SCREENER_DEFAULT_VALUES);
    }
  }

  updateQueryParams(formValue: StockScreenerValues): void {
    // creates a string to save into query params: sections=marketCap:1_price:3_
    const dataToSave = Object.entries(formValue)
      .reduce((acc, [key, value]) => {
        const castedKey = key as keyof StockScreenerValues;
        const keyIndex = getScreenerInputIndexByKey(castedKey, value);

        const result = value ? `${castedKey}:${[keyIndex]}` : '';
        return [...acc, result];
      }, [] as string[])
      // filter out empty strings
      .filter((value) => value)
      // join with underscore
      .join('_');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sections: dataToSave,
      },
    });
  }
}
