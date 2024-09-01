import { OverlayModule } from '@angular/cdk/overlay';
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
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote } from '@mm/api-types';
import { SymbolSearchService } from '@mm/market-stocks/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, ElementFocusDirective, QuoteItemComponent, RangeDirective } from '@mm/shared/ui';
import { filter, map, of, startWith, switchMap } from 'rxjs';
import { StockSummaryDialogComponent } from '../stock-summary-dialog/stock-summary-dialog.component';

@Component({
  selector: 'app-symbol-search-basic',
  standalone: true,
  imports: [
    OverlayModule,
    QuoteItemComponent,
    MatButtonModule,
    MatIconModule,
    ElementFocusDirective,
    RangeDirective,
    MatFormFieldModule,
    MatInputModule,
    DefaultImgDirective,
    MatDividerModule,
    MatRadioModule,
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
        <!-- check if load ticker or crypto -->
        <mat-radio-group
          class="mb-4 flex justify-between"
          color="primary"
          aria-label="Select symbol type"
          [value]="searchCrypto()"
          (change)="onSearchTypeChange($event)"
        >
          <mat-radio-button [value]="false">Ticker</mat-radio-button>
          <mat-radio-button [value]="true">Crypto</mat-radio-button>
        </mat-radio-group>

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
            @if (!last) {
              <mat-divider />
            }
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

  overlayWidth = signal(0);

  /**
   * open overlay if input is focused and has no value
   */
  isInputFocused = signal(false);

  /**
   * if true, load crypto symbols
   */
  searchCrypto = signal<boolean>(false);

  /**
   * loaded symbol data by user's input typing
   */
  private loadedQuotesByInput = toSignal(
    toObservable(this.searchValue).pipe(
      filter((value) => value.length > 0),
      switchMap((value) =>
        value.length <= 5 // prevent too many requests
          ? this.marketApiService.searchQuotesByPrefix(value, this.searchCrypto()).pipe(
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
      return { ...this.loadedQuotesByInput() };
    }

    if (this.searchCrypto()) {
      return { data: this.symbolSearchService.getDefaultCrypto(), isLoading: false, noData: false };
    }

    // combine last searched and default symbols
    const lastSearch = [
      ...this.symbolSearchService.getSearchedSymbols(),
      ...this.symbolSearchService.getDefaultSymbols(),
    ]
      // remove duplicates
      .reduce((acc, curr) => {
        const exist = acc.find((d) => d.symbol === curr.symbol);
        if (exist) {
          return acc;
        }

        // add to accumulator
        return [...acc, curr];
      }, [] as SymbolQuote[])
      .slice(0, 10);

    return { data: lastSearch, isLoading: false, noData: false };
  });

  onInputFocus(isFocused: boolean) {
    this.isInputFocused.set(isFocused);

    // calculate overlay width based on screen size
    const overlayWidth = this.triggerRef()?.nativeElement.getBoundingClientRect().width ?? 620;
    this.overlayWidth.set(overlayWidth);

    if (!isFocused) {
      // clear input
      this.searchValue.set('');
    }
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

  onSearchTypeChange(event: MatRadioChange) {
    // reset last searched symbols
    this.searchValue.set('');

    // set search type
    const value = event.value as boolean;
    this.searchCrypto.set(value);
  }

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
  }
}
