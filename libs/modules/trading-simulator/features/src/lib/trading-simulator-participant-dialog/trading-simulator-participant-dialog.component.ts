import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortfolioStateHolding, SymbolQuote, TradingSimulator } from '@mm/api-types';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioStateComponent,
  PortfolioStateOtherComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionsItemComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import { getPortfolioStateHoldingBaseByTransactionsUtil, roundNDigits } from '@mm/shared/general-util';
import { DialogCloseHeaderComponent, SectionTitleComponent } from '@mm/shared/ui';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';

export type TradingSimulatorParticipantDialogComponentData = {
  simulator: TradingSimulator;
  participantId: string;
};

@Component({
  selector: 'app-trading-simulator-participant-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    DialogCloseHeaderComponent,
    PortfolioStateComponent,
    PortfolioStateTransactionsComponent,
    PortfolioGrowthChartComponent,
    SectionTitleComponent,
    PortfolioHoldingsTableComponent,
    PortfolioStateOtherComponent,
    MatProgressSpinnerModule,
    PortfolioTransactionsItemComponent,
    MatDividerModule,
    NgClass,
    MatButtonModule,
  ],
  template: `
    <app-dialog-close-header title="Participant: {{ participantData()?.userData?.personal?.displayName }}" />
    <mat-dialog-content>
      @if (participantData(); as participant) {
        <div class="divide-wt-border grid grid-cols-3 divide-x-2">
          <!-- portfolio state -->
          <div class="px-4 py-2">
            <app-portfolio-state
              class="basis-3/5"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showCashSegment]="true"
              [portfolioState]="participant.portfolioState"
            />
          </div>

          <!-- additional info -->
          <div class="px-4 py-2">
            <app-portfolio-state-transactions
              class="basis-2/5"
              [showFees]="true"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [portfolioState]="participant.portfolioState"
            />
          </div>

          <!-- portfolio state -->
          <div class="px-4 py-2">
            <app-portfolio-state-other
              class="basis-3/5"
              data-testid="page-dashboard-portfolio-other"
              [portfolioState]="participant.portfolioState"
              [hallOfFameRank]="2"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            />
          </div>
        </div>

        <div class="py-2">
          <mat-divider />
        </div>

        <!-- growth -->
        <div class="mb-6">
          <app-portfolio-growth-chart
            chartType="balance"
            [data]="portfolioGrowthData()"
            [startCash]="data.simulator.cashStartingValue"
            [heightPx]="320"
            [displayHeader]="false"
            filterType="round"
          />
        </div>

        <div class="py-2">
          <mat-divider />
        </div>

        <!-- holdings -->
        <div class="mb-6">
          <app-section-title title="Holdings" matIcon="show_chart" titleSize="lg" class="mb-3" />
          <app-portfolio-holdings-table
            [portfolioState]="participant.portfolioState"
            [holdings]="participantDataHoldings()"
            [displayedColumns]="displayedColumns"
          />
        </div>

        <div class="py-2">
          <mat-divider />
        </div>

        <!-- transactions -->
        <div class="divide-wt-border grid grid-cols-2 divide-x-2">
          <div class="px-6 py-2">
            <!-- best transactions -->
            <app-section-title title="Best Returns" matIcon="trending_up" titleSize="lg" class="mb-3" />
            @for (item of transactionState().best; track item.transactionId; let last = $last) {
              <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                <app-portfolio-transactions-item dateType="round" [transaction]="item" />
              </div>
            } @empty {
              <div class="py-2">
                <div class="g-table-empty">No data has been found</div>
              </div>
            }
          </div>

          <div class="px-6 py-2">
            <!-- worst transactions -->
            <app-section-title title="Worst Returns" matIcon="trending_down" titleSize="lg" class="mb-3" />
            @for (item of transactionState().worst; track item.transactionId; let last = $last) {
              <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                <app-portfolio-transactions-item dateType="round" [transaction]="item" />
              </div>
            } @empty {
              <div class="py-2">
                <div class="g-table-empty">No data has been found</div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="grid place-content-center">
          <mat-spinner />
        </div>
      }
    </mat-dialog-content>

    <div class="py-2">
      <mat-divider />
    </div>

    <mat-dialog-actions>
      <div class="g-mat-dialog-actions-end">
        <button type="button" mat-flat-button mat-dialog-close>Cancel</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorParticipantDialogComponent {
  private readonly tradingSimulatorService = inject(TradingSimulatorService);
  readonly data = inject<TradingSimulatorParticipantDialogComponentData>(MAT_DIALOG_DATA);

  readonly ColorScheme = ColorScheme;

  readonly displayedColumns = ['symbol', 'price', 'bep', 'balance', 'invested', 'totalChange', 'portfolio'];

  readonly participantData = toSignal(
    this.tradingSimulatorService.getTradingSimulatorByIdParticipantById(
      this.data.simulator.id,
      this.data.participantId,
    ),
  );

  readonly symbolAggregations = toSignal(
    this.tradingSimulatorService.getTradingSimulatorAggregationSymbols(this.data.simulator.id),
  );

  readonly participantDataHoldings = computed(() => {
    const symbolAggregations = this.symbolAggregations();
    const participant = this.participantData();

    if (!symbolAggregations || !participant) {
      return [];
    }

    const transactions = participant.transactions;
    const portfolio = participant.portfolioState;

    return getPortfolioStateHoldingBaseByTransactionsUtil(transactions).map(
      (holding) =>
        ({
          ...holding,
          weight: roundNDigits(holding.invested / portfolio.invested, 2),
          symbolQuote: {
            price: symbolAggregations[holding.symbol].price,
          } as SymbolQuote,
        }) satisfies PortfolioStateHolding,
    );
  });

  readonly portfolioGrowthData = computed(() => {
    const participant = this.participantData();
    const simulator = this.data.simulator;

    return {
      values: participant?.portfolioGrowth ?? [],
      currentCash:
        participant?.portfolioGrowth.reduce((acc, _, i) => {
          const newCashIssue = simulator.cashAdditionalIssued
            .filter((d) => d.issuedOnRound <= i + 1)
            .reduce((acc, curr) => acc + curr.value, 0);
          return [...acc, simulator.cashStartingValue + newCashIssue];
        }, [] as number[]) ?? [],
    };
  });

  readonly transactionState = computed(() => {
    const transactions = this.participantData()?.transactions ?? [];

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

  constructor() {
    effect(() => {
      console.log({
        participantData: this.participantData(),
        symbolAggregations: this.symbolAggregations(),
        participantDataHoldings: this.participantDataHoldings(),
      });
    });
  }
}
