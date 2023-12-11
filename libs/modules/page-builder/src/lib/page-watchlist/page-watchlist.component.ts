import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SymbolSummary } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { StockSearchBasicComponent, StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { GetStocksSummaryPipe, StockSummaryTableComponent } from '@market-monitor/modules/market-stocks/ui';
import { DialogServiceModule, DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';
import { filter, map, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-page-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    StockSummaryTableComponent,
    GetStocksSummaryPipe,
    StockSummaryDialogComponent,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    StockSearchBasicComponent,
    DialogServiceModule,
  ],
  templateUrl: './page-watchlist.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageWatchlistComponent implements OnInit {
  readonly displayCheckValue = 25;

  authenticationUserService = inject(AuthenticationUserService);
  dialog = inject(MatDialog);
  dialogServiceUtil = inject(DialogServiceUtil);

  /**
   * all symbols in the user's watchlist
   */
  userWatchlistSymbolsSignal = toSignal(
    this.authenticationUserService.getUserWatchlist().pipe(map((watchlist) => watchlist?.data.map((d) => d.symbol))),
  );

  searchSymbolControl = new FormControl<SymbolSummary | null>(null, { nonNullable: true });
  /**
   * the number of results to currently display
   */
  displayResultsSignal = signal(this.displayCheckValue);

  ngOnInit(): void {
    this.searchSymbolControl.valueChanges
      .pipe(
        filter((value): value is SymbolSummary => !!value),
        switchMap((summary) =>
          this.authenticationUserService.isSymbolInWatchlist(summary.id).pipe(
            map((isInWatchlist) => ({ summary, isInWatchlist })),
            take(1),
          ),
        ),
      )
      .subscribe(({ summary, isInWatchlist }) => {
        console.log(summary, isInWatchlist);

        if (isInWatchlist) {
          this.dialogServiceUtil.showNotificationBar('Symbol already in watchlist', 'error', 3000);
        } else {
          this.authenticationUserService.addSymbolToUserWatchlist(summary.id, 'STOCK');
          this.dialogServiceUtil.showNotificationBar('Symbol added into watchlist', 'success', 3000);
        }
      });
  }

  onNearEndScroll(): void {
    // increase only if maxScreenerResults is less than screenerResults length
    if (this.displayResultsSignal() > (this.userWatchlistSymbolsSignal()?.length ?? 0)) {
      return;
    }
    this.displayResultsSignal.update((prev) => prev + this.displayCheckValue);
  }

  onSummaryClick(summary: SymbolSummary): void {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
