import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote, USER_WATCHLIST_SYMBOL_LIMIT } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { StockSummaryTableComponent } from '@mm/market-stocks/ui';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { SectionTitleComponent } from '@mm/shared/ui';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-page-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    StockSummaryTableComponent,
    StockSummaryDialogComponent,
    MatDialogModule,
    MatIconModule,
    SectionTitleComponent,
    MatButtonModule,
  ],
  template: `
    <div class="flex items-center justify-between mb-10">
      <app-section-title [title]="pageTitle()" matIcon="monitoring" />

      <button mat-button color="warn" (click)="onClearWatchList()">
        <mat-icon>delete_history</mat-icon>
        Clear Watchlist
      </button>
    </div>

    <!-- table -->
    <app-stock-summary-table
      (itemClickedEmitter)="onQuoteClick($event)"
      [symbolQuotes]="userWatchListSymbolsSignal()"
    />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageWatchlistComponent {
  /**
   * how many symbols to display before scrolling down
   */
  readonly displayCheckValue = 25;

  private authenticationUserService = inject(AuthenticationUserStoreService);
  private dialog = inject(MatDialog);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private marketApiService = inject(MarketApiService);

  watchList = this.authenticationUserService.state.watchList;

  /**
   * all symbols in the user's watchlist
   */
  userWatchListSymbolsSignal = toSignal(
    toObservable(this.watchList).pipe(
      switchMap((watchList) => this.marketApiService.getSymbolQuotes(watchList.data.map((d) => d.symbol))),
    ),
    { initialValue: [] },
  );

  //computed(() => this.watchList().data.map((d) => d.symbol));

  pageTitle = computed(() => {
    const isPaid = this.authenticationUserService.state.isAccountNormalPaid();
    const watchList = this.authenticationUserService.state.watchList();
    return isPaid
      ? `Watchlist: ${watchList.data.length}`
      : `Watchlist: [${watchList.data.length} / ${USER_WATCHLIST_SYMBOL_LIMIT}]`;
  });

  onQuoteClick(summary: SymbolQuote): void {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  @Confirmable('Are you sure you want to clear your watchlist?', 'Confirm', true, 'CLEAR')
  onClearWatchList(): void {
    this.authenticationUserService.clearUserWatchList();
    this.dialogServiceUtil.showNotificationBar('Watchlist cleared', 'success');
  }
}
