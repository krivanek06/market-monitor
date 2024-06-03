import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SymbolSummary, USER_WATCHLIST_SYMBOL_LIMIT } from '@mm/api-types';
import { AUTHENTICATION_ACCOUNT_TOKEN } from '@mm/authentication/data-access';
import { SymbolFavoriteService } from '@mm/market-stocks/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';

@Component({
  selector: 'app-summary-action-buttons',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <mat-dialog-actions class="flex flex-col gap-x-6 gap-y-2 px-4 sm:flex-row">
      <!-- favorites button -->
      @if (isSymbolInWatchList()) {
        <button
          data-testid="summary-action-buttons-remove-watchlist"
          mat-stroked-button
          color="warn"
          (click)="onRemoveWatchList()"
          type="button"
          class="g-border-apply h-10 max-sm:w-full"
        >
          <mat-icon>do_not_disturb_on</mat-icon>
          watchlist - remove
        </button>
      } @else {
        <button
          data-testid="summary-action-buttons-add-watchlist"
          mat-stroked-button
          color="accent"
          (click)="onAddWatchList()"
          type="button"
          class="g-border-apply h-10 max-sm:w-full"
        >
          <mat-icon>star</mat-icon>
          watchlist - add
        </button>
      }

      @if (showRedirectButton()) {
        <button
          data-testid="summary-action-buttons-redirect"
          class="h-10 max-sm:w-full"
          type="button"
          mat-stroked-button
          color="primary"
          (click)="onDetailsRedirect()"
        >
          Go to Details
          <mat-icon iconPositionEnd>navigate_next</mat-icon>
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryActionButtonsComponent {
  private authenticationUserService = inject(AUTHENTICATION_ACCOUNT_TOKEN, {
    optional: true,
  });
  private symbolFavoriteService = inject(SymbolFavoriteService);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private route = inject(Router);
  private viewPortScroller = inject(ViewportScroller);
  private dialogRef = inject(MatDialogRef<any>);

  /**
   * id of the symbol - AAPL, MSFT, BTC etc
   */
  symbolSummary = input.required<SymbolSummary>();

  /**
   * whether to show the redirect button or not - used only for STOCK and ADR
   */
  showRedirectButton = input(false);

  isSymbolInWatchList = computed(() => {
    if (this.authenticationUserService) {
      return this.authenticationUserService.state.isSymbolInWatchList()(this.symbolSummary().id);
    }
    return this.symbolFavoriteService.isSymbolInFavorite(this.symbolSummary().id);
  });

  onRemoveWatchList(): void {
    if (this.authenticationUserService) {
      this.removeWatchList();
    } else {
      this.removeToFavorite();
    }
  }

  onAddWatchList(): void {
    if (this.authenticationUserService) {
      this.addWatchList();
    } else {
      this.addToFavorite();
    }
  }

  private addToFavorite(): void {
    this.symbolFavoriteService.addFavoriteSymbol(this.symbolSummary().quote);

    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary().id} has been added into favorites`);
  }

  private removeToFavorite(): void {
    this.symbolFavoriteService.removeFavoriteSymbol(this.symbolSummary().quote);

    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary().id} has been removed from favorites`);
  }

  private addWatchList() {
    if (!this.authenticationUserService) {
      return;
    }

    const userWatchlist = this.authenticationUserService.state.watchList().data;

    // check if user can add more symbols into watchlist
    if (userWatchlist.length >= USER_WATCHLIST_SYMBOL_LIMIT) {
      this.dialogServiceUtil.showNotificationBar(
        `You can not add more than ${USER_WATCHLIST_SYMBOL_LIMIT} symbols into watchlist`,
        'error',
      );
      return;
    }

    // save data into fireStore
    this.authenticationUserService.addSymbolToUserWatchList({
      symbol: this.symbolSummary().id,
      symbolType: 'STOCK',
      sector: this.symbolSummary().profile?.sector ?? 'Unknown',
    });

    // show notification
    this.dialogServiceUtil.showNotificationBar(
      `Symbol: ${this.symbolSummary().id} has been added into watchlist`,
      'success',
    );
  }

  private removeWatchList() {
    if (!this.authenticationUserService) {
      return;
    }
    // save data into fireStore
    this.authenticationUserService.removeSymbolFromUserWatchList({
      symbol: this.symbolSummary().id,
      symbolType: 'STOCK',
      sector: this.symbolSummary().profile?.sector ?? 'Unknown',
    });

    // show notification
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary().id} has been removed from watchlist`);
  }

  onDetailsRedirect(): void {
    // scroll to top
    this.viewPortScroller.scrollToPosition([0, 0]);

    // close dialog
    this.dialogRef.close();

    // routing kept here, because component is used in multiple places
    this.route.navigateByUrl(`${ROUTES_MAIN.STOCK_DETAILS}/${this.symbolSummary().id}`);
  }
}
