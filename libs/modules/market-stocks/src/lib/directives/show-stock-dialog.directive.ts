import { Directive, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarDividend, CalendarStockEarning } from '@market-monitor/api-types';
import { SCREEN_DIALOGS } from '@market-monitor/shared-utils-client';
import { Observable, filter, map, take, tap } from 'rxjs';
import {
  DividendItemsDialogComponent,
  EarningsHistoricalDialogComponent,
  EarningsItemsDialogComponent,
  StockSummaryDialogComponent,
} from '../dialogs';

@Directive({
  standalone: true,
})
export class ShowStockDialogDirective {
  dialog = inject(MatDialog);

  constructor() {}

  onShowSummary(symbol: string): Observable<boolean> {
    return this.dialog
      .open(StockSummaryDialogComponent, {
        data: {
          symbol: symbol,
        },
        panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
      })
      .afterClosed()
      .pipe(map((res) => !!res?.['redirect']));
  }

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
        tap((res) => this.onShowSummary(res.symbol)),
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
        tap((res) => this.onEarningsClicked(res.symbol)),
        take(1),
      )
      .subscribe();
  }

  onEarningsClicked(symbol: string): void {
    this.dialog.open(EarningsHistoricalDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
