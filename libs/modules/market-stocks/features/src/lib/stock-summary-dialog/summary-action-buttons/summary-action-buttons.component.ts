import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SymbolSummary, USER_WATCHLIST_SYMBOL_LIMIT } from '@mm/api-types';
import { AUTHENTICATION_ACCOUNT_TOKEN } from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';

@Component({
  selector: 'app-summary-action-buttons',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="flex flex-row justify-between gap-x-4 gap-y-2 px-4">
      <!-- favorites button (only for auth users) -->
      @if (authenticationUserService) {
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
            watchlist <span class="max-sm:hidden">- remove</span>
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
            watchlist <span class="max-sm:hidden">- add</span>
          </button>
        }
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
          <span class="max-sm:hidden">Go to</span> Details
          <mat-icon iconPositionEnd>navigate_next</mat-icon>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryActionButtonsComponent {
  readonly authenticationUserService = inject(AUTHENTICATION_ACCOUNT_TOKEN, {
    optional: true,
  });
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly route = inject(Router);
  private readonly viewPortScroller = inject(ViewportScroller);
  private readonly dialogRef = inject(MatDialog);

  /**
   * id of the symbol - AAPL, MSFT, BTC etc
   */
  readonly symbolSummary = input.required<SymbolSummary>();

  /**
   * whether to show the redirect button or not - used only for STOCK and ADR
   */
  readonly showRedirectButton = input(false);

  readonly isSymbolInWatchList = computed(() => {
    if (this.authenticationUserService) {
      return this.authenticationUserService.state.isSymbolInWatchList()(this.symbolSummary().id);
    }

    return false;
  });

  onRemoveWatchList(): void {
    if (this.authenticationUserService) {
      this.removeWatchList();
    }
  }

  onAddWatchList(): void {
    if (this.authenticationUserService) {
      this.addWatchList();
    }
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

    // close all dialogs
    this.dialogRef.closeAll();

    // routing kept here, because component is used in multiple places
    this.route.navigateByUrl(`${ROUTES_MAIN.STOCK_DETAILS}/${this.symbolSummary().id}`);
  }
}
