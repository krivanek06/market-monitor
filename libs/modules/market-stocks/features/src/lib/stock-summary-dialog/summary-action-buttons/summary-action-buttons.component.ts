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
import { SymbolSummary } from '@market-monitor/api-types';
import {
  AUTHENTICATION_ACCOUNT_TOKEN,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { SymbolFavoriteService } from '@market-monitor/modules/market-stocks/data-access';
import { DialogServiceUtil } from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-summary-action-buttons',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './summary-action-buttons.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryActionButtonsComponent implements OnInit {
  @Output() redirectClickedEmitter = new EventEmitter<void>();
  @Input({ required: true }) symbolSummary!: SymbolSummary;

  isSymbolInFavoriteSignal = signal<boolean>(false);

  isUserAuthenticatedSignal = signal(false);
  isSymbolInWatchlist = signal(false);

  constructor(
    private symbolFavoriteService: SymbolFavoriteService,
    private dialogServiceUtil: DialogServiceUtil,
    @Inject(AUTHENTICATION_ACCOUNT_TOKEN)
    @Optional()
    private authenticationUserService: AuthenticationUserStoreService,
  ) {
    if (this.authenticationUserService) {
      this.isUserAuthenticatedSignal.set(!!this.authenticationUserService.user);
    }
  }

  ngOnInit(): void {
    // check if symbol in favorite
    this.symbolFavoriteService.isSymbolInFavoriteObs(this.symbolSummary.id).subscribe((isInFavorite) => {
      this.isSymbolInFavoriteSignal.set(isInFavorite);
    });

    // check if symbol in watchlist
    this.checkIfSymbolInWatchlist();
  }

  private checkIfSymbolInWatchlist(): void {
    if (this.authenticationUserService) {
      const inWatchlist = this.authenticationUserService.isSymbolInWatchlist(this.symbolSummary.id);
      this.isSymbolInWatchlist.set(inWatchlist());
    }
  }

  onAddToFavorite(): void {
    this.symbolFavoriteService.addFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.symbolSummary.id,
    });
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been added into favorites`);
  }

  onRemoveToFavorite(): void {
    this.symbolFavoriteService.removeFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.symbolSummary.id,
    });
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been removed from favorites`);
  }

  async onAddWatchlist() {
    if (this.authenticationUserService) {
      await this.authenticationUserService.addSymbolToUserWatchlist(this.symbolSummary.id, 'STOCK');
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been added into watchlist`);
      this.checkIfSymbolInWatchlist();
    }
  }

  async onRemoveWatchlist() {
    if (this.authenticationUserService) {
      await this.authenticationUserService.removeSymbolFromUserWatchlist(this.symbolSummary.id, 'STOCK');
      this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been removed from watchlist`);
      this.checkIfSymbolInWatchlist();
    }
  }

  onDetailsRedirect(): void {
    this.redirectClickedEmitter.emit();
  }
}
