import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, Optional, ViewChild, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SymbolSummary } from '@market-monitor/api-types';
import {
  AUTHENTICATION_ACCOUNT_TOKEN,
  AuthenticationAccountService,
} from '@market-monitor/modules/authentication/data-access';
import { SymbolFavoriteService, SymbolSearchService } from '@market-monitor/modules/market-stocks/data-access';
import { ElementFocusDirective, QuoteItemComponent } from '@market-monitor/shared/ui';
import { iif, startWith, switchMap } from 'rxjs';
import { ShowStockDialogDirective } from '../show-stock-dialog.directive/show-stock-dialog.directive';
import { StockSearchBasicComponent } from '../stock-search-basic/stock-search-basic.component';

@Component({
  selector: 'app-stock-search-basic-customized',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StockSearchBasicComponent,
    OverlayModule,
    QuoteItemComponent,
    MatButtonModule,
    MatCheckboxModule,
    ElementFocusDirective,
  ],
  templateUrl: './stock-search-basic-customized.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  hostDirectives: [ShowStockDialogDirective],
})
export class StockSearchBasicCustomizedComponent implements OnInit {
  @ViewChild('trigger', { read: ElementRef }) trigger?: ElementRef<HTMLElement>;

  /**
   * selected stock summary from StockSearchBasicComponent
   */
  searchControl = new FormControl<SymbolSummary | null>(null);
  showFavoriteStocks = new FormControl<boolean>(false, { nonNullable: true });

  overlayWidth = signal(0);
  overlayIsOpen = signal({
    isInputFocused: false,
    inputHasValue: false,
  });
  isUserAuthenticatedSignal = signal(false);
  symbolFavoriteService = inject(SymbolFavoriteService);
  symbolSearchService = inject(SymbolSearchService);
  showStockSummaryDirective = inject(ShowStockDialogDirective);

  constructor(
    @Inject(AUTHENTICATION_ACCOUNT_TOKEN)
    @Optional()
    private authenticationAccountService: AuthenticationAccountService,
  ) {
    // Authentication may not exists when app is available in public
    if (this.authenticationAccountService) {
      this.authenticationAccountService?.isAuthenticationLoaded().subscribe((isAuthenticationLoaded) => {
        this.isUserAuthenticatedSignal.set(isAuthenticationLoaded);
      });
    }
  }

  /**
   * display stock summaries based on whether showFavoriteStocks is true or false
   */
  displayedStocksSignal = toSignal(
    this.showFavoriteStocks.valueChanges.pipe(
      startWith(this.showFavoriteStocks.value),
      switchMap((showFavoriteStocks) =>
        iif(
          () => showFavoriteStocks,
          this.symbolFavoriteService.getFavoriteSymbols(),
          this.symbolSearchService.getSearchedSymbols(),
        ),
      ),
    ),
  );

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      if (value) {
        this.symbolSearchService.addSearchedSymbol({
          symbolType: 'STOCK',
          symbol: value.id,
        });
        this.onSummaryClick(value);
      }
    });
  }

  checkToDisplayOverlay(isInputFocused: boolean | null, inputHasValue: boolean | null): void {
    // console.log('checkToDisplayOverlay', isInputFocused, inputHasValue);

    const previousOverlayIsOpen = this.overlayIsOpen();
    this.overlayIsOpen.set({
      // isInputFocused: true,
      isInputFocused: isInputFocused !== null ? isInputFocused : previousOverlayIsOpen.isInputFocused,
      inputHasValue: inputHasValue !== null ? inputHasValue : previousOverlayIsOpen.inputHasValue,
    });

    // calculate overlay width based on screen size
    const overlayWidth = this.trigger?.nativeElement.getBoundingClientRect().width ?? 620;
    this.overlayWidth.set(overlayWidth);
  }

  onSummaryClick(summary: SymbolSummary) {
    // weird bug: if we don't set isInputFocused to false, the overlay will not close
    this.overlayIsOpen.update((d) => ({ ...d, isInputFocused: false }));

    this.showStockSummaryDirective.onShowSummary(summary.id);
  }
}
