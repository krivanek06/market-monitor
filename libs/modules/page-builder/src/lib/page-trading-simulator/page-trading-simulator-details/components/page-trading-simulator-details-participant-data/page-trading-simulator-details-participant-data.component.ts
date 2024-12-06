import { CurrencyPipe, KeyValuePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  OutstandingOrder,
  PortfolioStateHolding,
  PortfolioTransactionType,
  SymbolQuote,
  TradingSimulator,
  TradingSimulatorAggregationSymbols,
  TradingSimulatorAggregationSymbolsData,
  TradingSimulatorParticipant,
} from '@mm/api-types';
import {
  PortfolioBalancePieChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioStateComponent,
  PortfolioStateOtherComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTradeDialogComponent,
  PortfolioTradeDialogComponentData,
  PortfolioTransactionsItemComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme, SCREEN_LAYOUT_VALUES } from '@mm/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { getPortfolioStateHoldingBaseByTransactionsUtil, roundNDigits } from '@mm/shared/general-util';
import {
  DateReadablePipe,
  GeneralCardComponent,
  InArrayPipe,
  SectionTitleComponent,
  WINDOW_RESIZE_LISTENER,
} from '@mm/shared/ui';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-page-trading-simulator-details-participant-data',
  standalone: true,
  imports: [
    GeneralCardComponent,
    PortfolioStateComponent,
    PortfolioStateTransactionsComponent,
    PortfolioGrowthChartComponent,
    SectionTitleComponent,
    PortfolioHoldingsTableComponent,
    PortfolioStateOtherComponent,
    MatButtonModule,
    MatIconModule,
    KeyValuePipe,
    NgClass,
    CurrencyPipe,
    MatDialogModule,
    PortfolioTransactionsItemComponent,
    PortfolioTransactionsTableComponent,
    PortfolioBalancePieChartComponent,
    DateReadablePipe,
    InArrayPipe,
  ],
  template: `
    <!-- header -->
    <div class="flex flex-col items-center justify-between gap-y-4 max-xl:mb-3 sm:flex-row">
      <!-- info -->
      <div class="space-x-2 text-xl">
        <span class="text-wt-gray-dark">Round:</span>
        <span>{{ simulatorData().currentRound }}</span>
        <span>|</span>
        <span class="text-wt-gray-dark">Remaining:</span>
        <span>{{ (remainingTimeSeconds() | dateReadable: 'seconds') || 0 }}</span>
      </div>

      <!-- trading buttons -->
      <div class="child:w-[180px] flex gap-4">
        <button
          (click)="onOperationClick('BUY')"
          [disabled]="disabledTradingSymbols()"
          mat-stroked-button
          color="accent"
          type="button"
        >
          BUY
        </button>
        <button
          (click)="onOperationClick('SELL')"
          [disabled]="disabledTradingSymbols()"
          mat-stroked-button
          color="warn"
          type="button"
        >
          SELL
        </button>
      </div>
    </div>

    <!-- user info -->
    <div class="mb-4 grid items-center gap-x-8 gap-y-4 xl:grid-cols-5">
      <div class="xl:col-span-2">
        <app-general-card title="Account">
          <div class="grid gap-x-6 gap-y-4 p-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            <!-- portfolio state -->
            <app-portfolio-state
              class="xl:col-span-3"
              [showSpinner]="!participant()"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showCashSegment]="true"
              [portfolioState]="participant().portfolioState"
            />

            <!-- additional info -->
            <app-portfolio-state-transactions
              class="xl:col-span-2"
              [showFees]="true"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [portfolioState]="participant().portfolioState"
            />

            <!-- other info -->
            <app-portfolio-state-other
              class="max-xs:hidden xl:col-span-3"
              data-testid="page-dashboard-portfolio-other"
              [portfolioState]="participant().portfolioState"
              [hallOfFameRank]="2"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            />
          </div>
        </app-general-card>
      </div>

      <!-- portfolio growth chart -->
      <div class="xl:col-span-3">
        <app-portfolio-growth-chart
          chartType="balance"
          filterType="round"
          [data]="portfolioGrowthData()"
          [heightPx]="320"
          [displayLegend]="windowResize() >= SCREEN_LAYOUT_VALUES.LAYOUT_MD"
        />
      </div>
    </div>

    <!-- holdings -->
    <div class="mb-12 grid gap-x-4 xl:grid-cols-3">
      <div class="xl:col-span-2">
        <!-- holdings -->
        <app-section-title title="My Holdings" matIcon="show_chart" class="mb-3" />
        <app-general-card additionalClasses="min-h-[300px]">
          <app-portfolio-holdings-table
            [portfolioState]="participant().portfolioState"
            [holdings]="portfolioHolding()"
            [displayedColumns]="displayedColumnsHoldings"
          />
        </app-general-card>
      </div>
      <div class="self-center max-xl:hidden">
        <!-- chart -->
        <app-portfolio-balance-pie-chart [heightPx]="250" [data]="participant().portfolioState" />
      </div>
    </div>

    <!-- transactions -->
    <div class="grid gap-x-4 xl:grid-cols-3">
      <app-portfolio-transactions-table
        [data]="transactionState().lastOnes"
        [showSymbolFilter]="true"
        [pageSize]="15"
        [displayedColumns]="displayedColumnsTransactionTable"
        class="xl:col-span-2"
      />

      <div class="hidden gap-y-6 lg:pt-6 xl:grid">
        <!-- best transactions -->
        <app-general-card title="Best Returns" matIcon="trending_up" class="flex-1">
          @for (item of transactionState().best; track item.transactionId; let last = $last) {
            <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
              <app-portfolio-transactions-item dateType="round" [transaction]="item" />
            </div>
          }
        </app-general-card>

        <!-- worst transactions -->
        <app-general-card title="Worst Returns" matIcon="trending_down" class="flex-1">
          @for (item of transactionState().worst; track item.transactionId; let last = $last) {
            <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
              <app-portfolio-transactions-item dateType="round" [transaction]="item" />
            </div>
          }
        </app-general-card>
      </div>
    </div>

    <!-- symbol template to trade -->
    <ng-template #symbolTradeRef let-data>
      <div class="w-[360px]">
        <app-section-title title="Choose a symbol" class="mb-3">
          <div
            [ngClass]="{
              'text-wt-success': data?.operation === 'BUY',
              'text-wt-danger': data?.operation === 'SELL',
            }"
          >
            {{ data?.operation }}
          </div>
        </app-section-title>

        @if (symbolAggregations(); as symbolAggregations) {
          <div class="grid gap-2">
            @for (item of symbolAggregations | keyvalue; track item.key) {
              <button
                [disabled]="data?.operation === 'SELL' && !(portfolioHoldingSymbols() | inArray: item.key)"
                [matDialogClose]="item.value"
                mat-button
                class="w-full rounded-lg p-3"
                type="button"
              >
                <div class="flex justify-between">
                  <div class="text-wt-primary">{{ item.key }}</div>

                  <div class="space-x-1">
                    <span class="text-wt-gray-dark">{{ item.value.price | currency }}</span>
                    @if (data?.operation === 'BUY') {
                      <span> | </span>
                      <span>{{ item.value.unitsInfinity ? 'Unlimited' : item.value.unitsCurrentlyAvailable }}</span>
                    }
                  </div>
                </div>
              </button>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorDetailsParticipantDataComponent {
  protected readonly tradingSimulatorService = inject(TradingSimulatorService);
  protected readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly matDialog = inject(MatDialog);

  readonly participant = input.required<TradingSimulatorParticipant>();
  readonly simulatorData = input.required<TradingSimulator>();
  readonly symbolAggregations = input<TradingSimulatorAggregationSymbols>();
  readonly remainingTimeSeconds = input<number>(0);

  readonly symbolTradeRef = viewChild<TemplateRef<HTMLElement>>('symbolTradeRef');

  readonly windowResize = inject(WINDOW_RESIZE_LISTENER);
  readonly SCREEN_LAYOUT_VALUES = SCREEN_LAYOUT_VALUES;

  readonly transactionState = computed(() => {
    const transactions = this.participant().transactions;

    return {
      latest: transactions.at(-1),
      lastOnes: transactions,
      best: transactions
        .filter((d) => d.returnValue > 0)
        .sort((a, b) => b.returnValue - a.returnValue)
        .slice(0, 5),
      worst: transactions
        .filter((d) => d.returnValue < 0)
        .sort((a, b) => a.returnValue - b.returnValue)
        .slice(0, 5),
    };
  });

  readonly portfolioHolding = computed(() => {
    const symbolAggregations = this.symbolAggregations();
    const participant = this.participant();
    const transactions = participant.transactions;
    const portfolio = participant.portfolioState;

    if (!symbolAggregations) {
      return [];
    }

    return getPortfolioStateHoldingBaseByTransactionsUtil(transactions).map(
      (holding) =>
        ({
          ...holding,
          weight: roundNDigits(holding.invested / portfolio.invested, 2),
          symbolQuote: {
            previousClose: symbolAggregations[holding.symbol].pricePrevious,
            price: symbolAggregations[holding.symbol].price,
          } as SymbolQuote,
        }) satisfies PortfolioStateHolding,
    );
  });

  readonly portfolioHoldingSymbols = computed(() => this.portfolioHolding().map((d) => d.symbol));

  readonly portfolioGrowthData = computed(() => {
    const participant = this.participant();
    const simulator = this.simulatorData();

    return {
      values: participant.portfolioGrowth,
      currentCash: participant.portfolioGrowth.reduce((acc, _, i) => {
        const newCashIssue = simulator.cashAdditionalIssued
          .filter((d) => d.issuedOnRound <= i + 1)
          .reduce((acc, curr) => acc + curr.value, 0);
        return [...acc, simulator.cashStartingValue + newCashIssue];
      }, [] as number[]),
    };
  });

  /**
   * disable trading symbols if simulator is not live and current round is 0 or remaining time is approaching 0
   */
  readonly disabledTradingSymbols = computed(() => {
    const simulator = this.simulatorData();
    const remainingTime = this.remainingTimeSeconds();

    return (simulator.state !== 'live' && simulator.currentRound === 0) || remainingTime <= 3;
  });

  readonly ColorScheme = ColorScheme;

  readonly displayedColumnsHoldings = ['symbol', 'price', 'bep', 'balance', 'invested', 'onlyValue', 'portfolio'];
  readonly displayedColumnsTransactionTable = [
    'symbol',
    'transactionType',
    'totalValue',
    'unitPrice',
    'units',
    'transactionFees',
    'rounds',
    'returnPrct',
  ];

  constructor() {
    effect(() => {
      console.log('PageTradingSimulatorStatisticsParticipantDataComponent', {
        participant: this.participant(),
        simulatorData: this.simulatorData(),
        portfolioHolding: this.portfolioHolding(),
      });
    });
  }

  async onOperationClick(operation: PortfolioTransactionType) {
    const templateRef = this.symbolTradeRef();

    if (!templateRef) {
      return;
    }

    // open dialog to select symbol
    const dialogSymbolRef = this.matDialog.open(templateRef, {
      data: { operation },
    });

    const result = (await firstValueFrom(dialogSymbolRef.afterClosed())) as
      | TradingSimulatorAggregationSymbolsData
      | undefined;

    // no symbol was selected
    if (!result) {
      return;
    }

    // open dialog
    const dialogRef = this.matDialog.open<
      PortfolioTradeDialogComponent,
      PortfolioTradeDialogComponentData,
      OutstandingOrder | undefined
    >(PortfolioTradeDialogComponent, {
      data: {
        transactionType: operation,
        quote: {
          symbol: result.symbol,
          displaySymbol: result.symbol,
          price: result.price,
          exchange: 'STOCK',
          currentRound: this.simulatorData().currentRound,
        },
        userPortfolioStateHolding: {
          ...this.participant().portfolioState,
          holdings: this.portfolioHolding(),
        },
        isMarketOpen: true,
        userData: this.participant().userData,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });

    // get data from dialog
    const outstandingOrder = await firstValueFrom(dialogRef.afterClosed());

    console.log('dialogData', outstandingOrder);

    if (!outstandingOrder) {
      return;
    }

    // notify user
    this.dialogServiceUtil.showNotificationBar('Creating transaction...');

    try {
      // create transaction
      await this.tradingSimulatorService.createOutstandingOrder(this.simulatorData(), outstandingOrder);

      // notify user
      this.dialogServiceUtil.showNotificationBar('Transaction created', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }
}
