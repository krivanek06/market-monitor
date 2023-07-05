import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { StockSummary } from '@market-monitor/api-types';
import { QuoteItemComponent } from '@market-monitor/shared-components';
import { ElementFocusDirective } from '@market-monitor/shared-directives';
import { SCREEN_DIALOGS } from '@market-monitor/shared-utils-client';
import { Observable, iif, startWith, switchMap } from 'rxjs';
import { StockSummaryDialogComponent } from '../../dialogs';
import { StockStorageService } from '../../services';
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
  dialog = inject(MatDialog);
  stockStorageService = inject(StockStorageService);
  isStockSummaryLoaded$: Observable<boolean> = this.stockStorageService.isDataLoaded();

  /**
   * display stock summaries based on whether showFavoriteStocks is true or false
   */
  displayedStocksSignal = toSignal(
    this.showFavoriteStocks.valueChanges.pipe(
      startWith(this.showFavoriteStocks.value),
      switchMap((showFavoriteStocks) =>
        iif(
          () => showFavoriteStocks,
          this.stockStorageService.getFavoriteStocks(),
          this.stockStorageService.getLastSearchedStocks()
        )
      )
    )
  );

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      if (value) {
        this.stockStorageService.addSearchStock(value.id);
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

    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
