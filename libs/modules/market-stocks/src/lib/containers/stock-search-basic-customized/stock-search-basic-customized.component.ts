import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StockSummary } from '@market-monitor/api-types';
import { UserUnauthenticatedService } from '@market-monitor/modules/user';
import { QuoteItemComponent } from '@market-monitor/shared-components';
import { ElementFocusDirective } from '@market-monitor/shared-directives';
import { Observable, iif, startWith, switchMap } from 'rxjs';
import { ShowStockDialogDirective } from '../../directives';
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
  styleUrls: ['./stock-search-basic-customized.component.scss'],
  hostDirectives: [ShowStockDialogDirective],
})
export class StockSearchBasicCustomizedComponent implements OnInit {
  @ViewChild('trigger', { read: ElementRef }) trigger?: ElementRef<HTMLElement>;

  /**
   * selected stock summary from StockSearchBasicComponent
   */
  searchControl = new FormControl<StockSummary | null>(null);
  showFavoriteStocks = new FormControl<boolean>(false, { nonNullable: true });

  overlayWidth = signal(0);
  overlayIsOpen = signal({
    isInputFocused: false,
    inputHasValue: false,
  });
  userUnauthenticatedService = inject(UserUnauthenticatedService);
  showStockSummaryDirective = inject(ShowStockDialogDirective);
  isStockSummaryLoaded$: Observable<boolean> = this.userUnauthenticatedService.isDataLoaded();

  /**
   * display stock summaries based on whether showFavoriteStocks is true or false
   */
  displayedStocksSignal = toSignal(
    this.showFavoriteStocks.valueChanges.pipe(
      startWith(this.showFavoriteStocks.value),
      switchMap((showFavoriteStocks) =>
        iif(
          () => showFavoriteStocks,
          this.userUnauthenticatedService.getFavoriteStocks(),
          this.userUnauthenticatedService.getLastSearchedStocks(),
        ),
      ),
    ),
  );

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      if (value) {
        this.userUnauthenticatedService.addSearchStock(value.id);
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

  onSummaryClick(summary: StockSummary) {
    // weird bug: if we don't set isInputFocused to false, the overlay will not close
    this.overlayIsOpen.update((d) => ({ ...d, isInputFocused: false }));

    this.showStockSummaryDirective.onShowSummary(summary.id);
  }
}
