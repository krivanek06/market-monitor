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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote } from '@mm/api-types';
import { AUTHENTICATION_ACCOUNT_TOKEN } from '@mm/authentication/data-access';
import { SymbolFavoriteService, SymbolSearchService } from '@mm/market-stocks/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, ElementFocusDirective, QuoteItemComponent, RangeDirective } from '@mm/shared/ui';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { StockSummaryDialogComponent } from '../stock-summary-dialog/stock-summary-dialog.component';

@Component({
  selector: 'app-symbol-search-basic-customized',
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
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    DefaultImgDirective,
    MatDividerModule,
  ],
  template: `
    <mat-form-field class="w-full" cdkOverlayOrigin #trigger #origin="cdkOverlayOrigin">
      <mat-label>Search stock by ticker</mat-label>
      <input
        data-testid="search-basic-customized-input"
        type="text"
        placeholder="Enter ticker"
        aria-label="Text"
        matInput
        [value]="searchValue()"
        (input)="onInputChange($event)"
        [matAutocomplete]="auto"
        (focus)="onInputFocus(true)"
      />
      <mat-icon matPrefix>search</mat-icon>
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayProperty"
        [hideSingleSelectionIndicator]="true"
        [autofocus]="false"
        [autoActiveFirstOption]="false"
      >
        @if (options().isLoading) {
          <!-- loading skeleton -->
          <mat-option *ngRange="5" class="h-10 mb-1 g-skeleton"></mat-option>
        } @else {
          <!-- loaded data -->
          @for (quote of options().data; track quote.symbol; let last = $last) {
            <mat-option
              test-id="search-basic-customized-searched-quotes"
              class="py-2 rounded-md"
              [value]="quote"
              (onSelectionChange)="onSummaryClick(quote)"
            >
              <app-quote-item [symbolQuote]="quote" />
              @if (!last) {
                <div class="mt-2">
                  <mat-divider />
                </div>
              }
            </mat-option>
          }
        }
      </mat-autocomplete>
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
          overlayY: 'top'
        }
      ]"
      [cdkConnectedOverlayOpen]="isInputFocused() && !searchValue()"
    >
      <div
        appElementFocus
        (outsideClick)="onInputFocus(false)"
        data-testid="search-basic-customized-overlay"
        [style.max-width.px]="overlayWidth()"
        [style.min-width.px]="overlayWidth()"
        class="min-h-[200px] max-h-[400px] bg-wt-gray-light mt-[-18px] w-full rounded-md mx-auto overflow-y-scroll p-3 shadow-md"
      >
        <!-- checkbox changing displayed stock summaries -->
        @if (!isUserAuthenticatedSignal()) {
          <div data-testid="search-basic-customized-watchlist-checkbox" class="flex items-center justify-between mb-1">
            <span class="text-base text-wt-gray-medium">
              {{ showFavoriteStocks() ? 'Watch List' : 'Last Searched' }}
            </span>
            <mat-checkbox color="primary" [checked]="showFavoriteStocks()" (change)="onShowFavoriteChange()">
              Show Watch List
            </mat-checkbox>
          </div>
        }

        <!-- display summaries as buttons -->
        @for (quote of displayedStocksSignal(); track quote.symbol) {
          <button mat-button (click)="onSummaryClick(quote)" class="w-full h-12 max-sm:mb-2" type="button">
            <app-quote-item [symbolQuote]="quote" />
          </button>
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
export class SymbolSearchBasicCustomizedComponent {
  private symbolFavoriteService = inject(SymbolFavoriteService);
  private symbolSearchService = inject(SymbolSearchService);
  private marketApiService = inject(MarketApiService);
  private authenticationUserService = inject(AUTHENTICATION_ACCOUNT_TOKEN, {
    optional: true,
  });
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

  /**
   * loaded symbol data by user's input typing
   */
  options = toSignal(
    toObservable(this.searchValue).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) =>
        this.marketApiService.searchQuotesByPrefix(value).pipe(
          map((data) => ({
            data: data,
            isLoading: false,
          })),
          startWith({ isLoading: true, data: [] }),
        ),
      ),
    ),
    { initialValue: { isLoading: false, data: [] } },
  );

  triggerRef = viewChild('trigger', { read: ElementRef });

  showFavoriteStocks = signal(false);

  overlayWidth = signal(0);

  /**
   * open overlay if input is focused and has no value
   */
  isInputFocused = signal(false);
  isUserAuthenticatedSignal = signal(!!this.authenticationUserService);

  /**
   * display stock summaries based on whether showFavoriteStocks is true or false
   */
  displayedStocksSignal = computed(() => {
    const favorites = this.symbolFavoriteService.getFavoriteSymbols();
    // combine last searched and default symbols
    const lastSearch = [
      ...this.symbolSearchService.getSearchedSymbols(),
      ...this.symbolSearchService.getDefaultSymbols(),
    ].slice(0, 10);

    return this.showFavoriteStocks() ? favorites : lastSearch;
  });

  displayProperty = (stock: SymbolQuote) => stock.symbol;

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
