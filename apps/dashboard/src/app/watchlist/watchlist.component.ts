import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SymbolSummary } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { GetStocksSummaryPipe, StockSummaryTableComponent } from '@market-monitor/modules/market-stocks/ui';
import { SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';
import { map } from 'rxjs';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    StockSummaryTableComponent,
    GetStocksSummaryPipe,
    StockSummaryDialogComponent,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './watchlist.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistComponent {
  readonly displayCheckValue = 25;

  authenticationUserService = inject(AuthenticationUserService);
  dialog = inject(MatDialog);

  /**
   * all symbols in the user's watchlist
   */
  userWatchlistSymbolsSignal = toSignal(
    this.authenticationUserService.getUserWatchlist().pipe(map((watchlist) => watchlist?.data.map((d) => d.symbol))),
  );

  /**
   * the number of results to currently display
   */
  displayResultsSignal = signal(this.displayCheckValue);

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
