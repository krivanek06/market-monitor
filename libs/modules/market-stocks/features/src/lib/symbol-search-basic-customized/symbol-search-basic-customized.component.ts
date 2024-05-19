import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { SymbolQuote } from '@mm/api-types';
import { AUTHENTICATION_ACCOUNT_TOKEN } from '@mm/authentication/data-access';
import { SymbolFavoriteService, SymbolSearchService } from '@mm/market-stocks/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { ElementFocusDirective, QuoteItemComponent, RangeDirective } from '@mm/shared/ui';
import { SymbolSearchBasicComponent } from '../symbol-search-basic/symbol-search-basic.component';
import { StockSummaryDialogComponent } from '../stock-summary-dialog/stock-summary-dialog.component';

@Component({
  selector: 'app-symbol-search-basic-customized',
  standalone: true,
  imports: [
    CommonModule,
    SymbolSearchBasicComponent,
    OverlayModule,
    QuoteItemComponent,
    MatButtonModule,
    MatCheckboxModule,
    ElementFocusDirective,
    RangeDirective,
  ],
  template: `
    <app-symbol-search-basic
      appElementFocus
      (insideClick)="checkToDisplayOverlay(true, null)"
      (inputHasValue)="checkToDisplayOverlay(null, $event)"
      (selectedValue)="onSymbolSelect($event)"
      cdkOverlayOrigin
      #trigger
      #origin="cdkOverlayOrigin"
    />

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
      [cdkConnectedOverlayOpen]="overlayIsOpen().isInputFocused && !overlayIsOpen().inputHasValue"
    >
      <div
        [style.max-width.px]="overlayWidth()"
        [style.min-width.px]="overlayWidth()"
        appElementFocus
        (outsideClick)="checkToDisplayOverlay(false, null)"
        class="min-h-[200px] max-h-[400px] bg-wt-gray-light mt-[-18px] w-full rounded-md mx-auto overflow-y-scroll p-3 shadow-md"
      >
        <!-- checkbox changing displayed stock summaries -->
        @if (!isUserAuthenticatedSignal()) {
          <div class="flex items-center justify-between mb-1">
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

        <!-- display default symbols -->
        @if (getDefaultSymbols().length > 0) {
          @if (!showFavoriteStocks() && displayedStocksSignal().length < 10) {
            @for (quote of getDefaultSymbols(); track quote.symbol) {
              <button mat-button (click)="onSummaryClick(quote)" class="w-full h-12 max-sm:mb-2" type="button">
                <app-quote-item [symbolQuote]="quote" />
              </button>
            }
          }
        } @else {
          <div *ngRange="10" class="g-skeleton h-11 mb-1"></div>
        }
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SymbolSearchBasicCustomizedComponent {
  private symbolFavoriteService = inject(SymbolFavoriteService);
  private symbolSearchService = inject(SymbolSearchService);
  private authenticationUserService = inject(AUTHENTICATION_ACCOUNT_TOKEN, {
    optional: true,
  });
  private dialog = inject(MatDialog);

  clickedQuote = output<SymbolQuote>();

  /**
   * open modal on summary click
   */
  openModalOnClick = input(true);
  trigger = viewChild('trigger', { read: ElementRef });

  showFavoriteStocks = signal(false);

  overlayWidth = signal(0);

  /**
   * open overlay if input is focused and has no value. If value (search) happens, close it
   */
  overlayIsOpen = signal({
    isInputFocused: false,
    inputHasValue: false,
  });
  isUserAuthenticatedSignal = signal(!!this.authenticationUserService);

  /**
   * display stock summaries based on whether showFavoriteStocks is true or false
   */
  displayedStocksSignal = computed(() =>
    this.showFavoriteStocks()
      ? this.symbolFavoriteService.getFavoriteSymbols()
      : this.symbolSearchService.getSearchedSymbols(),
  );
  getDefaultSymbols = this.symbolSearchService.getDefaultSymbols;

  onSymbolSelect(quote: SymbolQuote) {
    // open modal
    this.onSummaryClick(quote);

    // save
    this.symbolSearchService.addSearchedSymbol(quote);
  }

  checkToDisplayOverlay(isInputFocused: boolean | null, inputHasValue: boolean | null): void {
    this.overlayIsOpen.update((d) => ({
      isInputFocused: isInputFocused !== null ? isInputFocused : d.isInputFocused,
      inputHasValue: inputHasValue !== null ? inputHasValue : d.inputHasValue,
    }));

    // calculate overlay width based on screen size
    const overlayWidth = this.trigger()?.nativeElement.getBoundingClientRect().width ?? 620;
    this.overlayWidth.set(overlayWidth);
  }

  onSummaryClick(quote: SymbolQuote) {
    // weird bug: if we don't set isInputFocused to false, the overlay will not close
    this.overlayIsOpen.update((d) => ({ ...d, isInputFocused: false }));

    if (this.openModalOnClick()) {
      this.dialog.open(StockSummaryDialogComponent, {
        data: {
          symbol: quote.symbol,
        },
        panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
      });
    }

    this.clickedQuote.emit(quote);
  }

  onShowFavoriteChange() {
    this.showFavoriteStocks.set(!this.showFavoriteStocks());
  }
}
