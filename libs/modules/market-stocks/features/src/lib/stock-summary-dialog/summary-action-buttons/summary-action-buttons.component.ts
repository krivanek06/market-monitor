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
  AuthenticationAccountService,
} from '@market-monitor/modules/authentication/data-access';
import { SymbolFavoriteService } from '@market-monitor/modules/market-stocks/data-access';
import { DialogServiceUtil } from '@market-monitor/shared/utils-client';
import { map } from 'rxjs';

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
    private authenticationAccountService: AuthenticationAccountService,
  ) {
    if (this.authenticationAccountService) {
      this.isUserAuthenticatedSignal.set(!!this.authenticationAccountService.user);
    }
  }

  ngOnInit(): void {
    // check if symbol in favorite
    this.symbolFavoriteService.isSymbolInFavoriteObs(this.symbolSummary.id).subscribe((isInFavorite) => {
      this.isSymbolInFavoriteSignal.set(isInFavorite);
    });

    // check if symbol in watchlist
    if (this.authenticationAccountService) {
      this.authenticationAccountService
        .getUserWatchlist()
        .pipe(map((watchlist) => watchlist.data.map((d) => d.symbol).includes(this.symbolSummary.id)))
        .subscribe((isInWatchlist) => {
          this.isSymbolInWatchlist.set(isInWatchlist);
        });
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

  onAddWatchlist(): void {}

  onRemoveWatchlist(): void {}

  onDetailsRedirect(): void {
    this.redirectClickedEmitter.emit();
  }
}
