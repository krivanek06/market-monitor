import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SymbolSummary } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { GetStocksSummaryPipe, StockSummaryTableComponent } from '@market-monitor/modules/market-stocks/ui';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';

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
  ],
  template: `
    <div class="flex items-center justify-between">
      <!-- title -->
      <div class="flex items-center gap-2 mb-8 text-xl text-wt-primary">
        <mat-icon>monitoring</mat-icon>
        Watchlist
      </div>
    </div>

    <!-- table -->
    <app-stock-summary-table
      appScrollNearEnd
      (nearEnd)="onNearEndScroll()"
      (itemClickedEmitter)="onSummaryClick($event)"
      [stockSummaries]="
        userWatchListSymbolsSignal() | slice: 0 : displayResultsSignal() | getStocksSummary: displayCheckValue | async
      "
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
  readonly displayCheckValue = 25;

  authenticationUserService = inject(AuthenticationUserStoreService);
  dialog = inject(MatDialog);
  dialogServiceUtil = inject(DialogServiceUtil);

  /**
   * all symbols in the user's watchlist
   */
  userWatchListSymbolsSignal = computed(() =>
    this.authenticationUserService.state.watchList().data.map((d) => d.symbol),
  );
  /**
   * the number of results to currently display
   */
  displayResultsSignal = signal(this.displayCheckValue);

  onNearEndScroll(): void {
    // increase only if maxScreenerResults is less than screenerResults length
    if (this.displayResultsSignal() > (this.userWatchListSymbolsSignal()?.length ?? 0)) {
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
