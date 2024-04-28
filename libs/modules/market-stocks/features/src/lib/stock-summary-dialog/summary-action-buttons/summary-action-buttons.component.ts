import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SymbolSummary, USER_WATCHLIST_SYMBOL_LIMIT } from '@mm/api-types';
import { AUTHENTICATION_ACCOUNT_TOKEN } from '@mm/authentication/data-access';
import { SymbolFavoriteService } from '@mm/market-stocks/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';

@Component({
  selector: 'app-summary-action-buttons',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <mat-dialog-actions class="flex flex-col px-4 sm:flex-row gap-y-2 gap-x-6">
      <!-- favorites button -->
      <ng-container *ngIf="!isUserAuthenticatedSignal()">
        <button
          *ngIf="isSymbolInFavoriteSignal()"
          mat-stroked-button
          color="warn"
          (click)="onRemoveToFavorite()"
          type="button"
          class="g-border-apply max-sm:w-full h-10"
        >
          <mat-icon>do_not_disturb_on</mat-icon>
          favorites - remove
        </button>
        <button
          *ngIf="!isSymbolInFavoriteSignal()"
          mat-stroked-button
          color="accent"
          (click)="onAddToFavorite()"
          type="button"
          class="g-border-apply max-sm:w-full h-10"
        >
          <mat-icon>star</mat-icon>
          favorite - add
        </button>
      </ng-container>

      <!-- watchlist button -->
      <ng-container *ngIf="isUserAuthenticatedSignal()">
        <button
          *ngIf="isSymbolInWatchList()"
          mat-stroked-button
          color="warn"
          (click)="onRemoveWatchList()"
          type="button"
          class="g-border-apply max-sm:w-full h-10"
        >
          <mat-icon>do_not_disturb_on</mat-icon>
          watchlist - remove
        </button>
        <button
          *ngIf="!isSymbolInWatchList()"
          mat-stroked-button
          color="accent"
          (click)="onAddWatchList()"
          type="button"
          class="g-border-apply max-sm:w-full h-10"
        >
          <mat-icon>star</mat-icon>
          watchlist - add
        </button>
      </ng-container>

      <button class="max-sm:w-full h-10" type="button" mat-stroked-button color="primary" (click)="onDetailsRedirect()">
        Go to Details
        <mat-icon iconPositionEnd>navigate_next</mat-icon>
      </button>
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

  redirectClickedEmitter = output<void>();
  symbolSummary = input.required<SymbolSummary>();

  isSymbolInFavoriteSignal = computed(() => this.symbolFavoriteService.isSymbolInFavoriteObs(this.symbolSummary().id));

  isUserAuthenticatedSignal = computed(() => {
    if (this.authenticationUserService) {
      return !!this.authenticationUserService.state().user;
    }
    return false;
  });
  isSymbolInWatchList = computed(() => {
    if (this.authenticationUserService) {
      return this.authenticationUserService.state.isSymbolInWatchList()(this.symbolSummary().id);
    }
    return false;
  });

  onAddToFavorite(): void {
    this.symbolFavoriteService.addFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.symbolSummary().id,
    });

    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary().id} has been added into favorites`);
  }

  onRemoveToFavorite(): void {
    this.symbolFavoriteService.removeFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.symbolSummary().id,
    });

    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary().id} has been removed from favorites`);
  }

  async onAddWatchList() {
    if (this.authenticationUserService) {
      const isPaid = this.authenticationUserService.state.isAccountNormalPaid();
      const userWatchlist = this.authenticationUserService.state.watchList().data;

      // check if user can add more symbols into watchlist
      if (!isPaid && userWatchlist.length >= USER_WATCHLIST_SYMBOL_LIMIT) {
        this.dialogServiceUtil.showNotificationBar(
          `You can not add more than ${USER_WATCHLIST_SYMBOL_LIMIT} symbols into watchlist`,
          'error',
        );
        return;
      }

      // save data into fireStore
      this.authenticationUserService.addSymbolToUserWatchList(
        this.symbolSummary().id,
        'STOCK',
        this.symbolSummary()?.profile?.sector ?? 'Unknown',
      );

      // show notification
      this.dialogServiceUtil.showNotificationBar(
        `Symbol: ${this.symbolSummary().id} has been added into watchlist`,
        'success',
      );
    }
  }

  async onRemoveWatchList() {
    if (this.authenticationUserService) {
      // save data into fireStore
      this.authenticationUserService.removeSymbolFromUserWatchList(
        this.symbolSummary().id,
        'STOCK',
        this.symbolSummary()?.profile?.sector ?? 'Unknown',
      );

      // show notification
      this.dialogServiceUtil.showNotificationBar(
        `Symbol: ${this.symbolSummary().id} has been removed from watchlist`,
        'success',
      );
    }
  }

  onDetailsRedirect(): void {
    this.redirectClickedEmitter.emit();
  }
}
