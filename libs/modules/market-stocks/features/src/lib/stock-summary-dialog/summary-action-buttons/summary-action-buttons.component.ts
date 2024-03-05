import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SymbolSummary, USER_WATCHLIST_SYMBOL_LIMIT } from '@market-monitor/api-types';
import {
  AUTHENTICATION_ACCOUNT_TOKEN,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { SymbolFavoriteService } from '@market-monitor/modules/market-stocks/data-access';
import { DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';

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
export class SummaryActionButtonsComponent implements OnInit {
  @Output() redirectClickedEmitter = new EventEmitter<void>();
  @Input({ required: true }) symbolSummary!: SymbolSummary;

  isSymbolInFavoriteSignal = signal<boolean>(false);

  isUserAuthenticatedSignal = signal(false);
  isSymbolInWatchList = signal(false);

  constructor(
    private symbolFavoriteService: SymbolFavoriteService,
    private dialogServiceUtil: DialogServiceUtil,
    @Inject(AUTHENTICATION_ACCOUNT_TOKEN)
    @Optional()
    private authenticationUserService: AuthenticationUserStoreService,
  ) {
    if (this.authenticationUserService) {
      this.isUserAuthenticatedSignal.set(!!this.authenticationUserService.state().user);
    }
  }

  ngOnInit(): void {
    // check if symbol in favorite
    const isInFavorite = this.symbolFavoriteService.isSymbolInFavoriteObs(this.symbolSummary.id);
    this.isSymbolInFavoriteSignal.set(isInFavorite);

    // check if symbol in watchList
    this.checkIfSymbolInWatchList();
  }

  private checkIfSymbolInWatchList(): void {
    if (this.authenticationUserService) {
      const inWatchList = this.authenticationUserService.state.isSymbolInWatchList()(this.symbolSummary.id);
      this.isSymbolInWatchList.set(inWatchList);
    }
  }

  onAddToFavorite(): void {
    this.symbolFavoriteService.addFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.symbolSummary.id,
    });
    this.isSymbolInFavoriteSignal.set(true);
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been added into favorites`);
  }

  onRemoveToFavorite(): void {
    this.symbolFavoriteService.removeFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.symbolSummary.id,
    });
    this.isSymbolInFavoriteSignal.set(false);
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been removed from favorites`);
  }

  async onAddWatchList() {
    if (this.authenticationUserService) {
      const userFeatures = this.authenticationUserService.state.getUserData().features;
      const userWatchlist = this.authenticationUserService.state.watchList().data;

      // check if user can add more symbols into watchlist
      if (!userFeatures.allowUnlimitedSymbolsInWatchList && userWatchlist.length >= USER_WATCHLIST_SYMBOL_LIMIT) {
        this.dialogServiceUtil.showNotificationBar(
          `You can not add more than ${USER_WATCHLIST_SYMBOL_LIMIT} symbols into watchlist`,
          'error',
        );
        return;
      }

      // save data into fireStore
      await this.authenticationUserService.addSymbolToUserWatchList(this.symbolSummary.id, 'STOCK');

      // show notification
      this.dialogServiceUtil.showNotificationBar(
        `Symbol: ${this.symbolSummary.id} has been added into watchlist`,
        'success',
      );
      this.checkIfSymbolInWatchList();
    }
  }

  async onRemoveWatchList() {
    if (this.authenticationUserService) {
      // save data into fireStore
      await this.authenticationUserService.removeSymbolFromUserWatchList(this.symbolSummary.id, 'STOCK');

      // show notification
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been removed from watchlist`);
      this.checkIfSymbolInWatchList();
    }
  }

  onDetailsRedirect(): void {
    this.redirectClickedEmitter.emit();
  }
}
