import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SymbolSummary, USER_WATCHLIST_SYMBOL_LIMIT } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { GetStocksSummaryPipe, StockSummaryTableComponent } from '@market-monitor/modules/market-stocks/ui';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { SectionTitleComponent } from '@market-monitor/shared/ui';

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
    SectionTitleComponent,
  ],
  template: `
    <app-section-title [title]="pageTitle()" matIcon="monitoring" class="mb-10" />

    <!-- table -->
    <app-stock-summary-table
      (itemClickedEmitter)="onSummaryClick($event)"
      [stockSummaries]="userWatchListSymbolsSignal() | getStocksSummary: displayCheckValue | async"
    ></app-stock-summary-table>
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

  watchList = this.authenticationUserService.state.watchList;

  /**
   * all symbols in the user's watchlist
   */
  userWatchListSymbolsSignal = computed(() => this.watchList().data.map((d) => d.symbol));

  pageTitle = computed(() => {
    const userFeatures = this.authenticationUserService.state.getUserData().features;
    const watchList = this.authenticationUserService.state.watchList();
    return userFeatures.allowUnlimitedSymbolsInWatchList
      ? `Watchlist: ${watchList.data.length}`
      : `Watchlist: [${watchList.data.length} / ${USER_WATCHLIST_SYMBOL_LIMIT}]`;
  });

  onSummaryClick(summary: SymbolSummary): void {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
