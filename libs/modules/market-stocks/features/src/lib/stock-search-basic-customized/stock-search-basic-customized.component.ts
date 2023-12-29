import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { SymbolSummary } from '@market-monitor/api-types';
import {
  AUTHENTICATION_ACCOUNT_TOKEN,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { SymbolFavoriteService, SymbolSearchService } from '@market-monitor/modules/market-stocks/data-access';
import { SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { ElementFocusDirective, QuoteItemComponent } from '@market-monitor/shared/ui';
import { iif, startWith, switchMap } from 'rxjs';
import { StockSearchBasicComponent } from '../stock-search-basic/stock-search-basic.component';
import { StockSummaryDialogComponent } from '../stock-summary-dialog/stock-summary-dialog.component';

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
  template: `
    <app-stock-search-basic
      appElementFocus
      (insideClick)="checkToDisplayOverlay(true, null)"
      (inputHasValue)="checkToDisplayOverlay(null, $event)"
      [formControl]="searchControl"
      cdkOverlayOrigin
      #trigger
      #origin="cdkOverlayOrigin"
      [showHint]="showHint"
      [showValueChange]="showValueChange"
      [displayValue]="displayValue"
    ></app-stock-search-basic>

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
        <div *ngIf="!isUserAuthenticatedSignal()" class="flex items-center justify-between mb-1">
          <span class="text-base text-wt-gray-medium">
            <ng-container *ngIf="!showFavoriteStocks.value">Last Searched</ng-container>
            <ng-container *ngIf="showFavoriteStocks.value">Favorite Stocks</ng-container>
          </span>
          <mat-checkbox color="primary" [formControl]="showFavoriteStocks"> Show Favorites </mat-checkbox>
        </div>

        <!-- display summaries as buttons -->
        <button
          mat-button
          *ngFor="let summary of displayedStocksSignal()"
          (click)="onSummaryClick(summary)"
          class="w-full h-12 max-sm:mb-2"
          type="button"
        >
          <app-quote-item
            [displayValue]="displayValue"
            [symbolQuote]="summary.quote"
            [assetUrl]="summary.profile?.image"
          ></app-quote-item>
        </button>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class StockSearchBasicCustomizedComponent implements OnInit {
  @Output() clickedSummary = new EventEmitter<SymbolSummary>();
  @Input() showHint = true;
  /**
   * showing % change in overlay
   */
  @Input() showValueChange = true;
  /**
   * open modal on summary click
   */
  @Input() openModalOnClick = true;
  @Input() displayValue: 'name' | 'symbol' = 'name';

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
  private symbolFavoriteService = inject(SymbolFavoriteService);
  private symbolSearchService = inject(SymbolSearchService);
  private dialog = inject(MatDialog);

  constructor(
    @Inject(AUTHENTICATION_ACCOUNT_TOKEN)
    @Optional()
    private authenticationUserService: AuthenticationUserStoreService,
  ) {
    // Authentication may not exists when app is available in public
    if (this.authenticationUserService) {
      this.isUserAuthenticatedSignal.set(true);
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

    if (this.openModalOnClick) {
      this.dialog.open(StockSummaryDialogComponent, {
        data: {
          symbol: summary.id,
        },
        panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
      });
    }

    this.clickedSummary.emit(summary);
  }
}
