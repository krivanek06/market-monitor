import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote, USER_WATCHLIST_SYMBOL_LIMIT } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import { StockSummaryTableComponent } from '@mm/market-stocks/ui';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { SectionTitleComponent } from '@mm/shared/ui';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-page-watchlist',
  standalone: true,
  imports: [
    StockSummaryTableComponent,
    SymbolSummaryDialogComponent,
    MatDialogModule,
    MatIconModule,
    SectionTitleComponent,
    MatButtonModule,
  ],
  template: `
    <div class="mb-10 flex items-center justify-between">
      <app-section-title [title]="pageTitle()" matIcon="monitoring" />

      <button mat-button color="warn" (click)="onClearWatchList()" class="hidden sm:block">
        <mat-icon>delete_history</mat-icon>
        Clear Watchlist
      </button>
    </div>

    <!-- table -->
    <app-stock-summary-table
      (itemClickedEmitter)="onQuoteClick($event)"
      [symbolSkeletonLoaders]="watchList().data.length"
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

  private readonly authenticationUserService = inject(AuthenticationUserStoreService);
  private readonly dialog = inject(MatDialog);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly marketApiService = inject(MarketApiService);

  readonly watchList = this.authenticationUserService.state.watchList;

  /**
   * all symbols in the user's watchlist
   */
  readonly userWatchListSymbolsSignal = toSignal(
    toObservable(this.watchList).pipe(
      switchMap((watchList) => this.marketApiService.getSymbolQuotes(watchList.data.map((d) => d.symbol))),
    ),
  );

  readonly pageTitle = computed(() => {
    const watchList = this.authenticationUserService.state.watchList();
    return `Watchlist: [${watchList.data.length} / ${USER_WATCHLIST_SYMBOL_LIMIT}]`;
  });

  onQuoteClick(summary: SymbolQuote): void {
    this.dialog.open(SymbolSummaryDialogComponent, {
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
