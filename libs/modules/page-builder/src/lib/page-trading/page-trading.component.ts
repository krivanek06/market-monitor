import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarketApiService } from '@mm/api-client';
import { OutstandingOrder, PortfolioTransactionType, SymbolQuote, USER_HOLDINGS_SYMBOL_LIMIT } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { SymbolSearchBasicComponent } from '@mm/market-stocks/features';
import { SymbolSummaryListComponent } from '@mm/market-stocks/ui';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { PortfolioTradeDialogComponent, PortfolioTradeDialogComponentData } from '@mm/portfolio/features';
import {
  OutstandingOrderCardDataComponent,
  PortfolioStateComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  FormMatInputWrapperComponent,
  QuoteItemComponent,
  RangeDirective,
  SectionTitleComponent,
  SortByKeyPipe,
} from '@mm/shared/ui';
import { catchError, firstValueFrom, map, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-trading',
  standalone: true,
  imports: [
    PortfolioStateComponent,
    SymbolSearchBasicComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AssetPriceChartInteractiveComponent,
    SymbolSummaryListComponent,
    PortfolioTransactionsTableComponent,
    PortfolioTradeDialogComponent,
    MatTooltipModule,
    SortByKeyPipe,
    QuoteItemComponent,
    RangeDirective,
    SectionTitleComponent,
    FormMatInputWrapperComponent,
    ReactiveFormsModule,
    NgClass,
    OutstandingOrderCardDataComponent,
    MatTabsModule,
    MatDividerModule,
  ],
  template: `
    <!-- account state -->
    <div class="mb-12 flex flex-col justify-between gap-8 md:flex-row">
      <!-- account state -->
      <app-portfolio-state
        data-testid="page-trading-portfolio-state"
        class="max-md:flex-1 md:basis-2/5 2xl:basis-1/3"
        [titleColor]="ColorScheme.PRIMARY_VAR"
        [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
        [showCashSegment]="state.isAccountDemoTrading()"
        [portfolioState]="portfolioUserFacadeService.portfolioStateHolding()"
      />

      <div class="flex flex-col gap-6 max-md:flex-1 md:basis-3/5 lg:basis-2/5 2xl:basis-1/3">
        <!-- search -->
        <app-symbol-search-basic
          data-testid="page-trading-symbol-search-basic"
          class="h-12 w-full"
          (clickedQuote)="onSymbolQuoteClick($event)"
          [openModalOnClick]="false"
          [holdings]="holdingsInputSource()"
        />

        <!-- action buttons -->
        <div class="mx-auto flex w-full gap-4">
          <button
            data-testid="page-trading-buy-button"
            (click)="onOperationClick('BUY')"
            class="w-full"
            [disabled]="!allowBuyOperationSignal() || !allowActionButtons()"
            mat-stroked-button
            color="accent"
            type="button"
          >
            BUY
          </button>
          <button
            data-testid="page-trading-sell-button"
            (click)="onOperationClick('SELL')"
            class="w-full"
            [disabled]="!allowActionButtons()"
            mat-stroked-button
            color="warn"
            type="button"
          >
            SELL
          </button>
        </div>
      </div>
    </div>

    <!-- historical chart & summary -->
    @if (symbolSummarySignal().state === 'success') {
      @if (symbolSummarySignal().data; as symbolSummary) {
        <div class="mb-6 flex flex-col gap-4 xl:flex-row">
          <app-asset-price-chart-interactive
            data-testid="page-trading-asset-price-chart-interactive"
            class="lg:basis-3/5"
            [imageName]="symbolSummary.id"
            [symbol]="symbolSummary.id"
            [title]="'Historical Price: ' + symbolSummary.quote.displaySymbol"
            [chartHeightPx]="400"
            [errorFromParent]="!symbolSummary.priceChange['5D']"
          />
          <div
            class="lg:basis-2/5"
            [ngClass]="{
              'opacity-65': !symbolSummary.priceChange['5D'],
            }"
          >
            <app-symbol-summary-list data-testid="page-trading-symbol-summary-list" [symbolSummary]="symbolSummary" />
          </div>
        </div>
      }
    } @else if (symbolSummarySignal().state === 'loading') {
      <!-- skeleton -->
      <div class="mb-6 flex flex-col gap-4 xl:flex-row">
        <div class="g-skeleton min-h-[450px] lg:basis-3/5"></div>
        <div class="g-skeleton min-h-[450px] lg:basis-2/5"></div>
      </div>
    } @else {
      <div class="grid h-[440px] place-content-center text-center text-lg">Failed to load symbol summary</div>
    }

    @if (state.outstandingOrders().length > 0) {
      <!-- divider -->
      <div class="mb-3 py-2">
        <mat-divider />
      </div>

      <!-- outstanding orders -->
      <app-section-title title="Open Outstanding Orders" class="mb-4" matIcon="reorder" />
      <div class="grid grid-cols-5 gap-x-4 gap-y-2">
        @for (order of state.outstandingOrders(); track order.orderId) {
          <app-outstanding-order-card-data [order]="order" (deleteClicked)="onOrderRemove(order)" />
        } @empty {
          <div class="col-span-5 p-4 text-center">No open orders</div>
        }
      </div>
    }

    <!-- divider -->
    <div class="my-5">
      <mat-divider />
    </div>

    <!-- top active -->
    <div class="mb-10 hidden lg:block">
      <app-section-title title="Top Active" matIcon="military_tech" />

      <div class="grid grid-cols-3 gap-x-6 gap-y-2 p-4 xl:grid-cols-4 2xl:grid-cols-5">
        @for (item of topPerformanceSignal(); track item.symbol) {
          <div
            data-testid="page-trading-top-active-symbols-wrapper"
            (click)="onSymbolQuoteClick(item)"
            [ngClass]="{
              'border-wt-primary': item.symbol === selectedSymbolControl.value,
              border: item.symbol === selectedSymbolControl.value,
            }"
            class="g-clickable-hover border-wt-border rounded-lg border-l border-r border-solid px-4 py-2 hover:border"
          >
            <app-quote-item data-testid="page-trading-top-active-symbols" [symbolQuote]="item" />
          </div>
        } @empty {
          <div *ngRange="20" class="g-skeleton h-10"></div>
        }
      </div>
    </div>

    <!-- divider -->
    <div class="mb-6 py-2">
      <mat-divider />
    </div>

    <!-- transaction history -->
    <app-portfolio-transactions-table
      data-testid="page-trading-portfolio-transactions-table"
      [showTransactionFees]="state.isAccountDemoTrading()"
      [showActionButton]="state.isAccountNormalBasic()"
      [data]="state.portfolioTransactions()"
      [showSymbolFilter]="true"
    />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingComponent {
  private readonly marketApiService = inject(MarketApiService);
  private readonly dialog = inject(MatDialog);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly authenticationUserService = inject(AuthenticationUserStoreService);
  readonly portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  readonly state = this.authenticationUserService.state;

  /**
   * track the selected holding by user, null if else is selected
   */
  readonly selectedSymbolControl = new FormControl<string>('AAPL', { nonNullable: true });

  /**
   * displayed symbol summary
   */
  readonly symbolSummarySignal = toSignal(
    this.selectedSymbolControl.valueChanges.pipe(
      startWith(this.selectedSymbolControl.value),
      switchMap((symbol) =>
        this.marketApiService.getSymbolSummary(symbol).pipe(
          map((d) => ({ data: d, state: 'success' as const })),
          catchError(() => {
            this.dialogServiceUtil.showNotificationBar('Error fetching symbol summary', 'error');
            return of({ data: null, state: 'error' as const });
          }),
          // to show loader every time the symbol changes
          startWith({ data: null, state: 'loading' as const }),
        ),
      ),
    ),
    { initialValue: { data: null, state: 'loading' as const } },
  );

  /**
   * check if stock market is open, crypto is open all the time
   */
  readonly isMarketOpen = computed(() => {
    const summary = this.symbolSummarySignal();
    const isCrypto = summary.data?.quote.exchange === 'CRYPTO' ? 'crypto' : 'stock';
    return this.marketApiService.isMarketOpenForQuote(isCrypto);
  });

  readonly topPerformanceSignal = toSignal(
    this.marketApiService.getMarketTopPerformance().pipe(map((d) => d.stockTopActive)),
  );

  /**
   * true if user has this symbol in his portfolio or he has not reached the limit of symbols
   */
  readonly allowBuyOperationSignal = computed(() => {
    const summary = this.symbolSummarySignal().data;
    const portfolioState = this.portfolioUserFacadeService.portfolioStateHolding();

    // disable buy operation until data is loaded
    if (!summary || !portfolioState) {
      return false;
    }

    // check if user has this symbol in his portfolio
    const userContainSymbol = portfolioState.holdings.map((d) => d.symbol).includes(summary.id);

    // check if user has reached the limit of symbols
    const userHoldingsLimit = portfolioState.holdings.length < USER_HOLDINGS_SYMBOL_LIMIT;

    return userContainSymbol || userHoldingsLimit;
  });

  /**
   * wait until data is loaded
   */
  readonly allowActionButtons = computed(() => {
    const portfolioState = this.portfolioUserFacadeService.portfolioStateHolding();
    const symbolSummary = this.symbolSummarySignal();

    // check if exists 5D price change, may happen that we get symbols which are deprecated
    // example: AAU, Maverix Metals Inc (MMX)
    return portfolioState && symbolSummary.state === 'success' && !!symbolSummary.data.priceChange['5D'];
  });

  readonly holdingsInputSource = computed(() => {
    return (
      this.portfolioUserFacadeService
        .portfolioStateHolding()
        ?.holdings?.map((holding) => holding.symbolQuote)
        .sort((a, b) => a.name.localeCompare(b.name)) ?? []
    );
  });

  readonly ColorScheme = ColorScheme;

  onSymbolQuoteClick(quote: SymbolQuote) {
    this.selectedSymbolControl.patchValue(quote.symbol);
  }

  async onOrderRemove(order: OutstandingOrder) {
    if (await this.dialogServiceUtil.showConfirmDialog('Are you sure you want to delete this order?')) {
      this.portfolioUserFacadeService.deleteOrder(order);
    }
  }

  async onOperationClick(transactionType: PortfolioTransactionType): Promise<void> {
    const summary = this.symbolSummarySignal().data;
    if (!summary) {
      this.dialogServiceUtil.showNotificationBar('Please select a stock first', 'notification');
      return;
    }

    // open dialog
    const dialogRef = this.dialog.open<
      PortfolioTradeDialogComponent,
      PortfolioTradeDialogComponentData,
      OutstandingOrder | undefined
    >(PortfolioTradeDialogComponent, {
      data: {
        transactionType: transactionType,
        quote: summary.quote,
        sector: summary.profile?.sector ?? summary.quote.exchange,
        userPortfolioStateHolding: this.portfolioUserFacadeService.portfolioStateHolding(),
        isMarketOpen: this.isMarketOpen(),
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });

    // get data from dialog
    const dialogData = await firstValueFrom(dialogRef.afterClosed());

    // dialog was closed
    if (!dialogData) {
      return;
    }

    try {
      // create order
      const result = this.portfolioUserFacadeService.createOrder(dialogData);

      // show notification
      if (result.type === 'order') {
        this.dialogServiceUtil.showNotificationBar('Order created, it will be fulfilled once market opens', 'success');
      } else {
        this.dialogServiceUtil.showNotificationBar('Transaction created', 'success');
      }
    } catch (e) {
      this.dialogServiceUtil.handleError(e);
    }
  }
}
