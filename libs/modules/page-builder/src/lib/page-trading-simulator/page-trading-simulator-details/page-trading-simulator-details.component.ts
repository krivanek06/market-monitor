import { NgClass, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortfolioTransactionsItemComponent, PortfolioTransactionsTableComponent } from '@mm/portfolio/ui';
import { GeneralCardComponent, RangeDirective, SectionTitleComponent, SortReversePipe } from '@mm/shared/ui';
import {
  TradingSimulatorSymbolPriceChartComponent,
  TradingSimulatorSymbolPriceChartLegendComponent,
  TradingSimulatorSymbolStatTableComponent,
} from '@mm/trading-simulator/ui';
import { differenceInSeconds } from 'date-fns';
import { map, of, switchMap, timer } from 'rxjs';
import { PageTradingSimulatorBaseComponent } from '../base/page-trading-simulator-base.component';
import { PageTradingSimulatorDetailsButtonsComponent } from './components/page-trading-simulator-details-buttons/page-trading-simulator-details-buttons.component';
import { PageTradingSimulatorDetailsInfoComponent } from './components/page-trading-simulator-details-info/page-trading-simulator-details-info.component';
import { PageTradingSimulatorDetailsParticipantDataComponent } from './components/page-trading-simulator-details-participant-data/page-trading-simulator-details-participant-data.component';
import { PageTradingSimulatorDetailsParticipantsDisplayComponent } from './components/page-trading-simulator-details-participants-display/page-trading-simulator-details-participants-display.component';

@Component({
  selector: 'app-page-trading-simulator-details',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    PageTradingSimulatorDetailsButtonsComponent,
    SectionTitleComponent,
    TradingSimulatorSymbolPriceChartComponent,
    TradingSimulatorSymbolPriceChartLegendComponent,
    TradingSimulatorSymbolStatTableComponent,
    PageTradingSimulatorDetailsParticipantsDisplayComponent,
    PortfolioTransactionsItemComponent,
    PageTradingSimulatorDetailsInfoComponent,
    GeneralCardComponent,
    SlicePipe,
    RangeDirective,
    PortfolioTransactionsTableComponent,
    PageTradingSimulatorDetailsParticipantDataComponent,
    NgClass,
    SortReversePipe,
    ReactiveFormsModule,
  ],
  template: `
    @if (simulatorData(); as simulatorData) {
      <div class="mb-6 flex flex-col justify-between gap-y-4 md:flex-row md:items-center">
        <app-section-title title="Simulator: {{ simulatorData.name }}" matIcon="sports_esports" />

        <!-- buttons to interact -->
        @if (!isUserDemoAccount()) {
          <app-page-trading-simulator-details-buttons [simulatorData]="simulatorData" />
        }
      </div>

      <!-- participant data -->
      @if (participant(); as participant) {
        <div class="mb-6">
          <app-page-trading-simulator-details-participant-data
            [participant]="participant"
            [simulatorData]="simulatorData"
            [symbolAggregations]="simulatorAggregationSymbols()"
            [remainingTimeSeconds]="remainingTimeSeconds()"
          />
        </div>
      }

      <div class="mb-6 grid gap-x-10 xl:grid-cols-4">
        <!-- left side -->
        <div class="col-span-3">
          <!-- symbol info -->
          <div class="mb-4 flex flex-col justify-between gap-y-4 md:flex-row">
            <app-section-title
              title="Symbol Price Movement"
              description="Charts indicates how the prices of each symbol have changed over time."
            />

            <app-trading-simulator-symbol-price-chart-legend [isOwner]="isAuthUserOwner()" />
          </div>

          <!-- display charts of symbols -->
          <div class="mb-6 grid gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
            @for (symbol of simulatorSymbols(); track symbol.symbol) {
              <app-trading-simulator-symbol-price-chart
                [simulator]="simulatorData"
                [simulatorSymbol]="symbol"
                [authUser]="authUserData()"
                [heightPx]="185"
              />
            } @empty {
              <div *ngRange="simulatorData.symbolAvailable" class="g-skeleton h-[185px]"></div>
            }
          </div>

          <!-- symbol statistics -->
          <app-section-title
            title="Symbol Statistics"
            description="Data updates in real time as participants create transactions"
            class="mb-3 pl-3"
          />
          <app-general-card>
            <app-trading-simulator-symbol-stat-table [data]="simulatorAggregationSymbols()" />
          </app-general-card>
        </div>

        <!-- right side -->
        <div class="max-xl:hidden">
          <!-- simulator info -->
          <app-page-trading-simulator-details-info
            [tradingSimulator]="simulatorData"
            [remainingTimeSeconds]="remainingTimeSeconds()"
            [isAuthUserOwner]="isAuthUserOwner()"
          />
        </div>
      </div>

      <!-- participants -->
      <app-page-trading-simulator-details-participants-display [simulator]="simulatorData" />

      <div class="mb-6 grid gap-x-6 gap-y-6 md:grid-cols-2">
        <!-- best transactions -->
        <app-general-card title="Best Returns" matIcon="trending_up" class="flex-1">
          @for (
            item of simulatorAggregationTransactions()?.bestTransactions | slice: 0 : 5;
            track item.transactionId;
            let last = $last
          ) {
            <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
              <app-portfolio-transactions-item dateType="round" [displayUser]="true" [transaction]="item" />
            </div>
          }
        </app-general-card>

        <!-- worst transactions -->
        <app-general-card title="Worst Returns" matIcon="trending_down" class="flex-1">
          @for (
            item of simulatorAggregationTransactions()?.worstTransactions | slice: 0 : 5;
            track item.transactionId;
            let last = $last
          ) {
            <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
              <app-portfolio-transactions-item dateType="round" [displayUser]="true" [transaction]="item" />
            </div>
          }
        </app-general-card>
      </div>

      <!-- display transactions -->
      <app-portfolio-transactions-table
        [data]="simulatorAggregationTransactions()?.lastTransactions | sortReverse"
        [showSymbolFilter]="true"
        [pageSize]="15"
        [displayedColumns]="displayedColumnsTransactionTable"
        title="Transaction History - Last 100"
        class="max-md:hidden xl:col-span-2"
      />
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorDetailsComponent extends PageTradingSimulatorBaseComponent {
  readonly isUserDemoAccount = this.authenticationUserStoreService.state.isDemoAccount;

  /** participating user data - may not exists if user is only a spectator */
  readonly participant = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) =>
        this.tradingSimulatorService.getTradingSimulatorByIdParticipantById(
          selectedId,
          this.authenticationUserStoreService.state.getUser().uid,
        ),
      ),
    ),
  );

  readonly remainingTimeSeconds = toSignal(
    toObservable(this.simulatorData).pipe(
      switchMap((simulatorData) =>
        simulatorData && simulatorData.state === 'started'
          ? timer(0, 1000).pipe(map(() => differenceInSeconds(simulatorData?.nextRoundTime, new Date())))
          : of(0),
      ),
    ),
    { initialValue: 0 },
  );

  readonly displayedColumnsTransactionTable = [
    'symbol',
    'transactionType',
    'user',
    'totalValue',
    'unitPrice',
    'units',
    'transactionFees',
    'rounds',
    'returnPrctOnly',
  ];
}
