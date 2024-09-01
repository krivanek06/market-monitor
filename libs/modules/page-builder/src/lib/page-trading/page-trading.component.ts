import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarketApiService } from '@mm/api-client';
import { PortfolioTransaction, PortfolioTransactionType, SymbolQuote, USER_HOLDINGS_SYMBOL_LIMIT } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { SymbolSearchBasicComponent } from '@mm/market-stocks/features';
import { SymbolSummaryListComponent } from '@mm/market-stocks/ui';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { PortfolioTradeDialogComponent, PortfolioTradeDialogComponentData } from '@mm/portfolio/features';
import { PortfolioStateComponent, PortfolioTransactionsTableComponent } from '@mm/portfolio/ui';
import { ColorScheme, InputSource } from '@mm/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  DropdownControlComponent,
  FormMatInputWrapperComponent,
  QuoteItemComponent,
  RangeDirective,
  SectionTitleComponent,
  SortByKeyPipe,
} from '@mm/shared/ui';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-trading',
  standalone: true,
  imports: [
    CommonModule,
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
    DropdownControlComponent,
  ],
  template: `
    <!-- account state -->
    <div class="mb-6 grid grid-cols-1 gap-8 md:grid-cols-2 xl:mb-2 xl:grid-cols-3">
      <!-- account state -->
      <app-portfolio-state
        data-testid="page-trading-portfolio-state"
        class="sm:pl-10"
        [titleColor]="ColorScheme.PRIMARY_VAR"
        [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
        [showCashSegment]="authenticationUserService.state.isAccountDemoTrading()"
        [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
      />

      <div class="flex flex-col gap-x-6 gap-y-6 max-md:-ml-4 xl:col-span-2 xl:flex-row">
        <!-- holdings -->
        <app-dropdown-control
          data-testid="page-trading-holding-dropdown"
          class="h-12 w-full scale-90"
          inputCaption="Select a holding"
          displayImageType="symbol"
          [inputSource]="holdingsInputSource()"
          [formControl]="selectedSymbolControl"
        />

        <!-- search -->
        <app-symbol-search-basic
          data-testid="page-trading-symbol-search-basic"
          class="h-12 w-full scale-90"
          (clickedQuote)="onSymbolQuoteClick($event)"
          [openModalOnClick]="false"
        />
      </div>
    </div>

    <!-- action buttons -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row xl:justify-end">
      <button
        data-testid="page-trading-buy-button"
        (click)="onOperationClick('BUY')"
        class="w-full xl:w-[280px]"
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
        class="w-full xl:w-[280px]"
        [disabled]="!allowActionButtons()"
        mat-stroked-button
        color="warn"
        type="button"
      >
        SELL
      </button>
    </div>

    <!-- historical chart & summary -->
    @if (symbolSummarySignal(); as symbolSummary) {
      <div class="mb-6 flex flex-col gap-4 xl:flex-row">
        <app-asset-price-chart-interactive
          data-testid="page-trading-asset-price-chart-interactive"
          class="lg:basis-3/5"
          [imageName]="symbolSummary.id"
          [symbol]="symbolSummary.id"
          [title]="'Historical Price: ' + symbolSummary.id"
        />
        <div class="lg:basis-2/5">
          <app-symbol-summary-list data-testid="page-trading-symbol-summary-list" [symbolSummary]="symbolSummary" />
        </div>
      </div>
    } @else {
      <div class="mb-6 flex h-[480px] flex-col gap-4 xl:flex-row">
        <div class="g-skeleton lg:basis-3/5"></div>
        <div class="g-skeleton lg:basis-2/5"></div>
      </div>
    }

    <!-- top active -->
    <div class="mb-10 hidden lg:block">
      <app-section-title title="Top Active" />

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
          <div *ngRange="20" class="g-skeleton h-9"></div>
        }
      </div>
    </div>

    <!-- transaction history -->
    <div>
      <app-portfolio-transactions-table
        data-testid="page-trading-portfolio-transactions-table"
        (deleteEmitter)="onTransactionDelete($event)"
        [showTransactionFees]="authenticationUserService.state.isAccountDemoTrading()"
        [showActionButton]="authenticationUserService.state.isAccountNormalBasic()"
        [data]="authenticationUserService.state.portfolioTransactions()"
        [showSymbolFilter]="true"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingComponent {
  private marketApiService = inject(MarketApiService);
  private dialog = inject(MatDialog);
  private dialogServiceUtil = inject(DialogServiceUtil);

  authenticationUserService = inject(AuthenticationUserStoreService);
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);

  /**
   * track the selected holding by user, null if else is selected
   */
  selectedSymbolControl = new FormControl<string>('AAPL', { nonNullable: true });

  /**
   * displayed symbol summary
   */
  symbolSummarySignal = toSignal(
    this.selectedSymbolControl.valueChanges.pipe(
      startWith(this.selectedSymbolControl.value),
      switchMap((symbol) =>
        this.marketApiService.getSymbolSummary(symbol).pipe(
          catchError((e) => {
            this.dialogServiceUtil.showNotificationBar('Error fetching symbol summary', 'error');
            return of(null);
          }),
          // to show loader every time the symbol changes
          startWith(null),
        ),
      ),
    ),
  );

  topPerformanceSignal = toSignal(this.marketApiService.getMarketTopPerformance().pipe(map((d) => d.stockTopActive)));

  /**
   * true if user has this symbol in his portfolio or he has not reached the limit of symbols
   */
  allowBuyOperationSignal = computed(() => {
    const summary = this.symbolSummarySignal();
    const portfolioState = this.portfolioUserFacadeService.getPortfolioState();

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
  allowActionButtons = computed(
    () => !!this.portfolioUserFacadeService.getPortfolioState() && !!this.symbolSummarySignal(),
  );

  holdingsInputSource = computed(() => {
    return (
      this.portfolioUserFacadeService.getPortfolioState()?.holdings?.map(
        (holding) =>
          ({
            value: holding.symbol,
            caption: `${holding.symbolQuote.name}`,
            image: holding.symbolQuote.symbol,
          }) satisfies InputSource<string>,
      ) ?? []
    ).sort((a, b) => a.caption.localeCompare(b.caption));
  });

  readonly ColorScheme = ColorScheme;

  onSymbolQuoteClick(quote: SymbolQuote) {
    this.selectedSymbolControl.patchValue(quote.symbol);
  }

  async onTransactionDelete(transaction: PortfolioTransaction) {
    if (await this.dialogServiceUtil.showConfirmDialog('Please confirm removing transaction')) {
      this.portfolioUserFacadeService.deletePortfolioOperation(transaction);
      this.dialogServiceUtil.showNotificationBar('Transaction removed', 'success');
    }
  }

  onOperationClick(transactionType: PortfolioTransactionType): void {
    const summary = this.symbolSummarySignal();
    if (!summary) {
      this.dialogServiceUtil.showNotificationBar('Please select a stock first', 'notification');
      return;
    }

    this.dialog.open(PortfolioTradeDialogComponent, {
      data: <PortfolioTradeDialogComponentData>{
        transactionType: transactionType,
        quote: summary.quote,
        sector: summary.profile?.sector ?? summary.quote.exchange,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });
  }
}
