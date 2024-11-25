import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import {
  PortfolioStateHolding,
  SymbolQuote,
  TradingSimulator,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
} from '@mm/api-types';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioStateComponent,
  PortfolioStateOtherComponent,
  PortfolioStateTransactionsComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import {
  getPortfolioGrowthAssets,
  getPortfolioStateHoldingBaseByTransactionsUtil,
  roundNDigits,
} from '@mm/shared/general-util';
import { GeneralCardComponent, SectionTitleComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-page-trading-simulator-statistics-participant-data',
  standalone: true,
  imports: [
    GeneralCardComponent,
    PortfolioStateComponent,
    PortfolioStateTransactionsComponent,
    PortfolioGrowthChartComponent,
    SectionTitleComponent,
    PortfolioStateOtherComponent,
    PortfolioHoldingsTableComponent,
  ],
  template: `
    <div class="mb-4 flex gap-x-8 gap-y-4">
      <app-general-card title="Account" class="min-h-[210px] basis-2/5">
        <div class="grid grid-cols-2 gap-x-2">
          <!-- portfolio state -->
          <app-portfolio-state
            [showSpinner]="!participant()"
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            [showCashSegment]="true"
            [portfolioState]="participant().portfolioState"
          />

          <!-- additional info -->
          <app-portfolio-state-other
            [titleColor]="ColorScheme.GRAY_DARK_VAR"
            [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            [portfolioState]="participant().portfolioState"
          />
        </div>
      </app-general-card>

      <!-- portfolio growth chart -->
      <div class="basis-3/5">
        <app-portfolio-growth-chart
          chartType="balance"
          [data]="{
            values: participant().portfolioGrowth,
          }"
          [startCash]="simulatorData().cashStartingValue"
          [heightPx]="240"
        />
      </div>
    </div>

    <div class="flex gap-x-4">
      <div class="basis-3/5">
        <!-- holdings -->
        <app-general-card title="My Holdings" matIcon="show_chart">
          <app-portfolio-holdings-table
            [portfolioState]="participant().portfolioState"
            [holdings]="portfolioHolding()"
            [displayedColumns]="displayedColumns"
          />
        </app-general-card>
      </div>
      <div class="basis-2/5">
        <!-- transactions -->
        my last transaction
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorStatisticsParticipantDataComponent {
  readonly participant = input.required<TradingSimulatorParticipant>();
  readonly simulatorData = input.required<TradingSimulator>();
  readonly simulatorSymbols = input.required<TradingSimulatorSymbol[]>();

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

  readonly portfolioGrowthAssets = computed(() =>
    getPortfolioGrowthAssets(this.participant().transactions, this.historicalPricesToCurrentRound()),
  );
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
        portfolioGrowthAssets: this.portfolioGrowthAssets(),
        portfolioHolding: this.portfolioHolding(),
      });
    });
  }
}
