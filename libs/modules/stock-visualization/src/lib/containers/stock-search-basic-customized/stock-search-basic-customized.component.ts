import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { StockSummary } from '@market-monitor/api-types';
import { SCREEN_DIALOGS } from '@market-monitor/shared-utils';
import { Observable } from 'rxjs';
import { StockSummaryItemComponent } from '../../components';
import { StockSummaryModalComponent } from '../../modals';
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
    StockSummaryItemComponent,
    MatButtonModule,
  ],
  templateUrl: './stock-search-basic-customized.component.html',
  styleUrls: ['./stock-search-basic-customized.component.scss'],
})
export class StockSearchBasicCustomizedComponent implements OnInit {
  @ViewChild('trigger', { read: ElementRef }) trigger?: ElementRef<HTMLElement>;

  searchControl = new FormControl<StockSummary | null>(null);
  overlayWidth = signal(0);
  overlayIsOpen = signal({
    isInputFocused: false,
    inputHasValue: false,
  });
  dialog = inject(MatDialog);
  stockStorageService = inject(StockStorageService);
  isStockSummaryLoaded$: Observable<boolean> = this.stockStorageService.isDataLoaded();
  favoriteStocks$: Observable<StockSummary[]> = this.stockStorageService.getFavoriteStocks();
  searchedStocks$: Observable<StockSummary[]> = this.stockStorageService.getLastSearchedStocks();

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
      if (value) {
        this.stockStorageService.addSearchStock(value.id);
        this.onSummaryClick(value);
      }
    });
  }

  checkToDisplayOverlay(isInputFocused: boolean | null, inputHasValue: boolean | null): void {
    console.log('checkToDisplayOverlay', isInputFocused, inputHasValue);

    const previousOverlayIsOpen = this.overlayIsOpen();
    this.overlayIsOpen.set({
      isInputFocused: true, //isInputFocused !== null ? isInputFocused : previousOverlayIsOpen.isInputFocused,
      inputHasValue: inputHasValue !== null ? inputHasValue : previousOverlayIsOpen.inputHasValue,
    });

    const overlayWidth = this.trigger?.nativeElement.getBoundingClientRect().width ?? 620;
    this.overlayWidth.set(overlayWidth);
  }

  onSummaryClick(summary: StockSummary) {
    this.dialog.open(StockSummaryModalComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
