import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockScreenerValues, SymbolSummary } from '@market-monitor/api-types';
import {
  STOCK_SCREENER_DEFAULT_VALUES,
  getScreenerInputIndexByKey,
  getScreenerInputValueByKey,
} from '@market-monitor/modules/market-stocks/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import {
  StockScreenerFormControlComponent,
  StockSummaryTableComponent,
} from '@market-monitor/modules/market-stocks/ui';
import { RouterManagement } from '@market-monitor/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { RangeDirective, ScrollNearEndDirective } from '@market-monitor/shared/ui';
import { catchError, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-page-stock-screener',
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
  ],
  templateUrl: './page-stock-screener.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PageStockScreenerComponent implements OnInit, RouterManagement {
  private screenerDefault = 30;
  stocksApiService = inject(StocksApiService);
  dialogServiceUtil = inject(DialogServiceUtil);
  dialog = inject(MatDialog);
  router = inject(Router);
  route = inject(ActivatedRoute);

  screenerFormControl = new FormControl<StockScreenerValues>(STOCK_SCREENER_DEFAULT_VALUES, { nonNullable: true });
  loadingSignal = signal(false);
  maxScreenerResults = signal(this.screenerDefault);
  screenerResults = toSignal(
    this.screenerFormControl.valueChanges.pipe(
      tap((formValue) => {
        // set loading to true
        this.loadingSignal.set(true);
        // reset maxScreenerResults to default
        this.maxScreenerResults.set(this.screenerDefault);
        // update query params
        this.updateQueryParams(formValue);
      }),
      switchMap((values) =>
        this.stocksApiService.getStockScreening(values).pipe(
          // set loading to false
          tap(() => this.loadingSignal.set(false)),
        ),
      ),
      catchError(() => {
        this.dialogServiceUtil.showNotificationBar('Error loading screener results', 'error');
        this.loadingSignal.set(false);
        return [];
      }),
    ),
  );

  ngOnInit(): void {
    this.loadQueryParams();
  }

  onNearEndScroll(): void {
    // increase only if maxScreenerResults is less than screenerResults length
    if (this.maxScreenerResults() > (this.screenerResults()?.length ?? 0)) {
      return;
    }
    this.maxScreenerResults.update((prev) => prev + this.screenerDefault);
  }

  onFormReset(): void {
    this.screenerFormControl.reset(STOCK_SCREENER_DEFAULT_VALUES);
  }

  onSummaryClick(summary: SymbolSummary): void {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
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
