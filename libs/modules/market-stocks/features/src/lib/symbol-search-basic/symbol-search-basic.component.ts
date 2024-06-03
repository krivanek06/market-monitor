import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote } from '@mm/api-types';
import { AUTHENTICATION_ACCOUNT_TOKEN } from '@mm/authentication/data-access';
import { SymbolFavoriteService, SymbolSearchService } from '@mm/market-stocks/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, ElementFocusDirective, QuoteItemComponent, RangeDirective } from '@mm/shared/ui';
import { filter, map, of, startWith, switchMap } from 'rxjs';
import { StockSummaryDialogComponent } from '../stock-summary-dialog/stock-summary-dialog.component';

@Component({
  selector: 'app-symbol-search-basic',
  standalone: true,
  imports: [
    CommonModule,
    OverlayModule,
    QuoteItemComponent,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    ElementFocusDirective,
    RangeDirective,
    MatFormFieldModule,
    MatInputModule,
    DefaultImgDirective,
    MatDividerModule,
  ],
  template: `
    <mat-form-field class="w-full" cdkOverlayOrigin #trigger #origin="cdkOverlayOrigin">
      <!-- search input -->
      <mat-label>Search stock by ticker</mat-label>
      <input
        data-testid="search-basic-input"
        type="text"
        placeholder="Enter ticker"
        aria-label="Text"
        matInput
        [value]="searchValue()"
        (input)="onInputChange($event)"
        (focus)="onInputFocus(true)"
      />
      <mat-icon matPrefix>search</mat-icon>
    </mat-form-field>

    <!-- overlay -->
    <ng-template
      cdkConnectedOverlay
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayMinWidth]="overlayWidth()"
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayPositions]="[
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        },
      ]"
      [cdkConnectedOverlayOpen]="isInputFocused()"
    >
      <div
        id="search-basic-overlay"
        appElementFocus
        (outsideClick)="onInputFocus(false)"
        data-testid="search-basic-overlay"
        [style.max-width.px]="overlayWidth()"
        [style.min-width.px]="overlayWidth()"
        class="bg-wt-gray-light mx-auto max-h-[400px] min-h-[200px] w-full overflow-y-scroll rounded-md p-3 shadow-md"
      >
        <!-- checkbox changing displayed favorites -->
        @if (!isUserAuthenticatedSignal() && searchValue().length === 0) {
          <div class="mb-1 flex items-center justify-between">
            <span class="text-wt-gray-medium text-base">
              {{ showFavoriteStocks() ? 'Watch List' : 'Last Searched' }}
            </span>
            <mat-checkbox
              data-testid="search-basic-watchlist-checkbox"
              color="primary"
              [checked]="showFavoriteStocks()"
              (change)="onShowFavoriteChange()"
            >
              Show Watch List
            </mat-checkbox>
          </div>
        }

        @if (displayQuotes().isLoading) {
          <!-- loading skeleton -->
          <div *ngRange="6" class="g-skeleton mb-1 h-10"></div>
        } @else {
          <!-- display summaries as buttons -->
          @for (quote of displayQuotes().data; track quote.symbol; let last = $last) {
            <button
              test-id="search-basic-quotes"
              mat-button
              type="button"
              class="h-12 w-full max-sm:mb-2"
              (click)="onSummaryClick(quote)"
            >
              <app-quote-item [symbolQuote]="quote" />
            </button>

            <!-- divider -->
            <mat-divider *ngIf="!last" />
          }

          <!-- no data -->
          @if (displayQuotes().noData) {
            <div data-testid="search-basic-no-data" class="grid h-24 place-content-center text-base">No data found</div>
          }
        }
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }

    ::ng-deep .mdc-menu-surface.mat-mdc-autocomplete-panel {
      max-height: 452px !important;
    }

    ::ng-deep .mdc-menu-surface.mat-mdc-autocomplete-panel {
      width: 95% !important;
      margin: auto !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SymbolSearchBasicComponent {
  private symbolFavoriteService = inject(SymbolFavoriteService);
  private symbolSearchService = inject(SymbolSearchService);
  private marketApiService = inject(MarketApiService);
  private dialog = inject(MatDialog);

  /**
   * emit when user clicks on a symbol quote
   */
  clickedQuote = output<SymbolQuote>();

  /**
   * open modal on summary click
   */
  openModalOnClick = input(true);

  /**
   * user's input value to load symbols
   */
  searchValue = signal('');

  triggerRef = viewChild('trigger', { read: ElementRef });

  showFavoriteStocks = signal(false);

  overlayWidth = signal(0);

  /**
   * open overlay if input is focused and has no value
   */
  isInputFocused = signal(false);

  /**
   * check if user is authenticated
   */
  isUserAuthenticatedSignal = signal(
    !!inject(AUTHENTICATION_ACCOUNT_TOKEN, {
      optional: true,
    }),
  );

  /**
   * loaded symbol data by user's input typing
   */
  private loadedQuotesByInput = toSignal(
    toObservable(this.searchValue).pipe(
      filter((value) => value.length > 0),
      switchMap((value) =>
        value.length <= 5 // prevent too many requests
          ? this.marketApiService.searchQuotesByPrefix(value).pipe(
              map((data) => ({
                data: data,
                isLoading: false,
                noData: data.length === 0,
              })),
              startWith({ isLoading: true, data: [], noData: false }),
            )
          : of({ isLoading: false, data: [], noData: true }),
      ),
    ),
    { initialValue: { isLoading: false, data: [], noData: false } },
  );

  displayQuotes = computed(() => {
    // return searched symbols by input
    if (this.searchValue().length > 0) {
      return { ...this.loadedQuotesByInput(), type: 'searched' as const };
    }

    // return favorite symbols
    if (this.showFavoriteStocks()) {
      const favorites = this.symbolFavoriteService.getFavoriteSymbols();
      return { data: favorites, isLoading: false, noData: false, type: 'favorites' as const };
    }

    // combine last searched and default symbols
    const lastSearch = [
      ...this.symbolSearchService.getSearchedSymbols(),
      ...this.symbolSearchService.getDefaultSymbols(),
    ].slice(0, 10);

    return { data: lastSearch, isLoading: false, noData: false, type: 'lastSearched' as const };
  });

  onInputFocus(isFocused: boolean) {
    this.isInputFocused.set(isFocused);

    // calculate overlay width based on screen size
    const overlayWidth = this.triggerRef()?.nativeElement.getBoundingClientRect().width ?? 620;
    this.overlayWidth.set(overlayWidth);
  }

  onSummaryClick(quote: SymbolQuote) {
    // save
    this.symbolSearchService.addSearchedSymbol(quote);

    // clear input
    this.searchValue.set('');

    if (this.openModalOnClick()) {
      this.dialog.open(StockSummaryDialogComponent, {
        data: {
          symbol: quote.symbol,
        },
        panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
      });
    }

    // emit clicked quote
    this.clickedQuote.emit(quote);

    // stop focus - needs to happen after 'focus' triggers again in HTML
    setTimeout(() => {
      this.isInputFocused.set(false);
    });
  }

  onShowFavoriteChange() {
    this.showFavoriteStocks.set(!this.showFavoriteStocks());
  }

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
  }
}
