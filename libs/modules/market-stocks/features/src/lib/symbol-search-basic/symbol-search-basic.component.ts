import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
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
import { SymbolSummaryDialogComponent } from '../stock-summary-dialog/symbol-summary-dialog.component';

@Component({
  selector: 'app-symbol-search-basic',
  standalone: true,
  imports: [
    NgClass,
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
    <mat-form-field
      class="w-full"
      cdkOverlayOrigin
      #trigger
      #origin="cdkOverlayOrigin"
      [style.height.px]="isSmallInput() ? 45 : undefined"
    >
      <!-- search input -->
      <mat-label
        [ngClass]="{
          'text-sm': isSmallInput(),
          'text-base': !isSmallInput(),
        }"
      >
        Search symbol by ticker
      </mat-label>
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
        class="bg-wt-gray-light @container mx-auto max-h-[400px] min-h-[200px] w-full overflow-y-scroll rounded-md p-3 shadow-md"
      >
        <!-- check if load ticker or crypto -->
        <mat-radio-group
          class="mb-4 flex justify-between"
          color="primary"
          aria-label="Select symbol type"
          [value]="searchSymbolType()"
          (change)="onSearchTypeChange($event)"
          data-testid="search-change-radio-group"
        >
          <mat-radio-button [value]="SelectorOptions.TICKER">Ticker</mat-radio-button>
          <mat-radio-button [value]="SelectorOptions.CRYPTO">Crypto</mat-radio-button>
          @if ((holdings()?.length ?? 0) > 0) {
            <mat-radio-button [value]="SelectorOptions.HOLDINGS" class="@sm:block hidden">Holdings</mat-radio-button>
          }
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

      /* hide the bottom element, it was causing some height issues */
      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      ::ng-deep .mdc-menu-surface.mat-mdc-autocomplete-panel {
        max-height: 452px !important;
      }

      ::ng-deep .mdc-menu-surface.mat-mdc-autocomplete-panel {
        width: 95% !important;
        margin: auto !important;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SymbolSearchBasicComponent {
  private readonly symbolSearchService = inject(SymbolSearchService);
  private readonly marketApiService = inject(MarketApiService);
  private readonly dialog = inject(MatDialog);

  /**
   * emit when user clicks on a symbol quote
   */
  readonly clickedQuote = output<SymbolQuote>();

  /**
   * open modal on summary click
   */
  readonly openModalOnClick = input(true);

  /**
   * user's holdings to display
   */
  readonly holdings = input<SymbolQuote[]>();

  /**
   * size of the input
   */
  readonly isSmallInput = input<boolean>(false);

  /**
   * user's input value to load symbols
   */
  readonly searchValue = signal('');

  readonly triggerRef = viewChild('trigger', { read: ElementRef });

  readonly overlayWidth = signal(0);

  /**
   * open overlay if input is focused and has no value
   */
  readonly isInputFocused = signal(false);

  /**
   * if true, load crypto symbols
   */
  readonly searchSymbolType = signal<keyof typeof this.SelectorOptions>('TICKER');

  readonly SelectorOptions = {
    TICKER: 'TICKER',
    CRYPTO: 'CRYPTO',
    HOLDINGS: 'HOLDINGS',
  } as const;

  /**
   * loaded symbol data by user's input typing
   */
  private readonly loadedQuotesByInput = toSignal(
    toObservable(this.searchValue).pipe(
      filter((value) => value.length > 0),
      switchMap((value) =>
        value.length <= 5 // prevent too many requests
          ? this.marketApiService.searchQuotesByPrefix(value, this.searchSymbolType() === 'CRYPTO').pipe(
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

  readonly displayQuotes = computed(() => {
    const searchSymbolType = this.searchSymbolType();
    // return searched symbols by input
    if (this.searchValue().length > 0) {
      return { ...this.loadedQuotesByInput() };
    }

    // return default crypto symbols
    if (searchSymbolType === 'CRYPTO') {
      return { data: this.symbolSearchService.getDefaultCrypto(), isLoading: false, noData: false };
    }

    // return holdings user has
    if (searchSymbolType === 'HOLDINGS') {
      return { data: this.holdings() ?? [], isLoading: false, noData: false };
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
      this.dialog.open(SymbolSummaryDialogComponent, {
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
    const value = event.value as keyof typeof this.SelectorOptions;
    this.searchSymbolType.set(value);
  }

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
  }
}
