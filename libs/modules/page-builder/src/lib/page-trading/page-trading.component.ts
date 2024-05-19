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
import { SymbolSearchBasicCustomizedComponent } from '@mm/market-stocks/features';
import { StockSummaryListComponent } from '@mm/market-stocks/ui';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { PortfolioTradeDialogComponent, PortfolioTradeDialogComponentData } from '@mm/portfolio/features';
import { PortfolioStateComponent, PortfolioTransactionsTableComponent } from '@mm/portfolio/ui';
import { ColorScheme, InputSource } from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
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
    SymbolSearchBasicCustomizedComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AssetPriceChartInteractiveComponent,
    StockSummaryListComponent,
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
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-6 xl:mb-2 gap-8">
      <!-- account state -->
      <app-portfolio-state
        class="sm:pl-10"
        [titleColor]="ColorScheme.PRIMARY_VAR"
        [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
        [showCashSegment]="authenticationUserService.state.isAccountDemoTrading()"
        [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
      />

      <div class="flex flex-col xl:flex-row gap-x-6 gap-y-6 xl:col-span-2 max-md:-ml-4">
        <!-- holdings -->
        <app-dropdown-control
          inputCaption="Select a holding"
          [inputSource]="holdingsInputSource()"
          displayImageType="symbol"
          [formControl]="selectedSymbolControl"
          class="scale-90 w-full h-12"
        />

        <!-- search -->
        <app-symbol-search-basic-customized
          (clickedQuote)="onSymbolQuoteClick($event)"
          [openModalOnClick]="false"
          class="scale-90 w-full h-12"
        />
      </div>
    </div>

    <!-- action buttons -->
    <div class="flex flex-col sm:flex-row xl:justify-end gap-4 mb-6">
      <button
        (click)="onOperationClick('BUY')"
        class="w-full xl:w-[280px]"
        [disabled]="!allowBuyOperationSignal()"
        mat-stroked-button
        color="accent"
        type="button"
      >
        BUY
      </button>
      <button
        (click)="onOperationClick('SELL')"
        class="w-full xl:w-[280px]"
        mat-stroked-button
        color="warn"
        type="button"
      >
        SELL
      </button>
    </div>

    <!-- historical chart & summary -->
    @if (symbolSummarySignal(); as symbolSummary) {
      <div class="flex flex-col gap-4 mb-6 xl:flex-row">
        <app-asset-price-chart-interactive
          class="lg:basis-3/5"
          [imageName]="symbolSummary.id"
          [symbol]="symbolSummary.id"
          [title]="'Historical Price: ' + symbolSummary.id"
        />
        <div class="lg:basis-2/5">
          <app-stock-summary-list [symbolSummary]="symbolSummary" />
        </div>
      </div>
    } @else {
      <div class="flex flex-col gap-4 mb-6 xl:flex-row h-[480px]">
        <div class="lg:basis-3/5 g-skeleton"></div>
        <div class="lg:basis-2/5 g-skeleton"></div>
      </div>
    }

    <!-- top active -->
    <div class="mb-10 hidden lg:block">
      <app-section-title title="Top Active" />

      <div class="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-2 p-4">
        @for (item of topPerformanceSignal(); track item.symbol) {
          <div
            (click)="onSymbolQuoteClick(item)"
            [ngClass]="{
              'border-wt-primary': item.symbol === selectedSymbolControl.value,
              border: item.symbol === selectedSymbolControl.value
            }"
            class="g-clickable-hover py-2 px-4 border-r border-l border-solid hover:border rounded-lg border-wt-border"
          >
            <app-quote-item [symbolQuote]="item" displayValue="symbol" />
          </div>
        } @empty {
          <div *ngRange="20" class="g-skeleton h-9"></div>
        }
      </div>
    </div>

    <!-- transaction history -->
    <div>
      <app-section-title title="Transaction History" matIcon="history" class="mb-5 lg:-mb-10" />

      <app-portfolio-transactions-table
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

  ColorScheme = ColorScheme;

  onSymbolQuoteClick(quote: SymbolQuote) {
    this.selectedSymbolControl.patchValue(quote.symbol);
  }

  @Confirmable('Please confirm removing transaction')
  onTransactionDelete(transaction: PortfolioTransaction) {
    this.portfolioUserFacadeService.deletePortfolioOperation(transaction);
    this.dialogServiceUtil.showNotificationBar('Transaction removed', 'notification');
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
        sector: summary.profile?.sector ?? '',
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });
  }
}
