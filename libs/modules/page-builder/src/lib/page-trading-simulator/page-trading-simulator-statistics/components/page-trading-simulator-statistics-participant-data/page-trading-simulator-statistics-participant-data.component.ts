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
  TradingSimulatorSymbol,
} from '@mm/api-types';
import { PortfolioTradeDialogComponent, PortfolioTradeDialogComponentData } from '@mm/portfolio/features';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioStateComponent,
  PortfolioStateOtherComponent,
  PortfolioStateTransactionsComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { getPortfolioStateHoldingBaseByTransactionsUtil, roundNDigits } from '@mm/shared/general-util';
import { GeneralCardComponent, SectionTitleComponent } from '@mm/shared/ui';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-page-trading-simulator-statistics-participant-data',
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
  ],
  template: `
    <div class="flex items-center justify-between">
      <div class="text-wt-gray-medium text-xl">Round: {{ simulatorData().currentRound }} | Remaining: TODO TODO</div>

      <div class="child:w-[180px] flex gap-4">
        <button
          data-testid="page-trading-buy-button"
          (click)="onOperationClick('BUY')"
          mat-stroked-button
          color="accent"
          type="button"
        >
          BUY
        </button>
        <button
          data-testid="page-trading-sell-button"
          (click)="onOperationClick('SELL')"
          mat-stroked-button
          color="warn"
          type="button"
        >
          SELL
        </button>
      </div>
    </div>

    <div class="mb-4 flex items-center gap-x-8 gap-y-4">
      <div class="basis-2/5">
        <app-general-card title="Account">
          <div class="flex gap-x-6 p-2">
            <!-- portfolio state -->
            <app-portfolio-state
              class="basis-3/5"
              [showSpinner]="!participant()"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showCashSegment]="true"
              [portfolioState]="participant().portfolioState"
            />

            <!-- additional info -->
            <app-portfolio-state-transactions
              class="basis-2/5"
              [showFees]="true"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [portfolioState]="participant().portfolioState"
            />
          </div>
          <div class="flex gap-x-6 p-2">
            <app-portfolio-state-other
              class="basis-3/5"
              data-testid="page-dashboard-portfolio-other"
              [portfolioState]="participant().portfolioState"
              [hallOfFameRank]="2"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            />
            <!-- keep empty div for styling -->
            <div class="basis-2/5"></div>
          </div>
        </app-general-card>
      </div>

      <!-- portfolio growth chart -->
      <div class="basis-3/5">
        <app-portfolio-growth-chart
          chartType="balance"
          [data]="{
            values: participant().portfolioGrowth,
          }"
          [startCash]="simulatorData().cashStartingValue"
          [heightPx]="320"
          [displayHeader]="false"
          [dataValueIsDate]="false"
        />
      </div>
    </div>

    <div class="grid grid-cols-3 gap-x-4">
      <div class="col-span-2">
        <!-- holdings -->
        <app-section-title title="My Holdings" matIcon="show_chart" titleSize="lg" class="mb-3" />
        <app-general-card additionalClasses="min-h-[300px]">
          <app-portfolio-holdings-table
            [portfolioState]="participant().portfolioState"
            [holdings]="portfolioHolding()"
            [displayedColumns]="displayedColumns"
          />
        </app-general-card>
      </div>
      <div>
        <!-- transactions -->
        <app-section-title title="My Last Transactions" matIcon="history" class="mb-3" titleSize="lg" />
        my last transaction
      </div>
    </div>

    <!-- symbol template to trade -->
    <ng-template #symbolTradeRef let-data>
      <div class="w-[360px]">
        <app-section-title title="Choose a symbol" class="mb-3" titleSize="lg">
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
              <button [matDialogClose]="item.value" mat-button class="w-full rounded-lg p-3" type="button">
                <div class="flex justify-between">
                  <div class="text-wt-primary">{{ item.key }}</div>

                  <div class="space-x-1">
                    <span class="text-wt-gray-dark">{{ item.value.price | currency }}</span>
                    <span> | </span>
                    <span>{{ item.value.unitsInfinity ? 'Unlimited' : item.value.unitsCurrentlyAvailable }}</span>
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
export class PageTradingSimulatorStatisticsParticipantDataComponent {
  protected readonly tradingSimulatorService = inject(TradingSimulatorService);
  protected readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly matDialog = inject(MatDialog);

  readonly participant = input.required<TradingSimulatorParticipant>();
  readonly simulatorData = input.required<TradingSimulator>();
  readonly simulatorSymbols = input.required<TradingSimulatorSymbol[]>();
  readonly symbolAggregations = input<TradingSimulatorAggregationSymbols>();

  readonly symbolTradeRef = viewChild<TemplateRef<HTMLElement>>('symbolTradeRef');

  private readonly historicalPricesToCurrentRound = computed(() => {
    const simulatorSymbols = this.simulatorSymbols();
    const currentRound = this.simulatorData().currentRound;

    return simulatorSymbols.reduce(
      (curr, acc) => ({
        ...curr,
        [acc.symbol]: acc.historicalDataModified
          .slice(0, currentRound)
          .map((price, date) => ({ close: price, date: String(date) })),
      }),
      {} as Record<string, { close: number; date: string }[]>,
    );
  });

  // todo - uncommented because it fails , formatting date and no date but rounds
  // readonly portfolioGrowthAssets = computed(() =>
  //   getPortfolioGrowthAssets(this.participant().transactions, this.historicalPricesToCurrentRound()),
  // );

  readonly portfolioHolding = computed(() => {
    const pricesToSymbols = this.historicalPricesToCurrentRound();
    const participant = this.participant();
    const transactions = participant.transactions;
    const portfolio = participant.portfolioState;

    return getPortfolioStateHoldingBaseByTransactionsUtil(transactions).map(
      (holding) =>
        ({
          ...holding,
          weight: roundNDigits(holding.invested / portfolio.invested, 2),
          symbolQuote: {
            price: pricesToSymbols[holding.symbol].at(-1)?.close ?? 0,
          } as SymbolQuote,
        }) satisfies PortfolioStateHolding,
    );
  });

  readonly ColorScheme = ColorScheme;

  readonly displayedColumns = ['symbol', 'price', 'bep', 'balance', 'invested', 'totalChange', 'portfolio'];

  constructor() {
    effect(() => {
      console.log('PageTradingSimulatorStatisticsParticipantDataComponent', {
        participant: this.participant(),
        simulatorData: this.simulatorData(),
        simulatorSymbols: this.simulatorSymbols(),
        historicalPricesToCurrentRound: this.historicalPricesToCurrentRound(),
        // portfolioGrowthAssets: this.portfolioGrowthAssets(),
        portfolioHolding: this.portfolioHolding(),
      });
    });
  }

  async onOperationClick(operation: PortfolioTransactionType) {
    console.log('onOperationClick', operation);
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
