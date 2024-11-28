import { CurrencyPipe, NgClass, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortfolioTransactionsItemComponent, PortfolioTransactionsTableComponent } from '@mm/portfolio/ui';
import {
  DateReadablePipe,
  GeneralCardComponent,
  RangeDirective,
  SectionTitleComponent,
  SortReversePipe,
} from '@mm/shared/ui';
import {
  TradingSimulatorParticipantItemComponent,
  TradingSimulatorSymbolPriceChartComponent,
  TradingSimulatorSymbolPriceChartLegendComponent,
  TradingSimulatorSymbolStatTableComponent,
} from '@mm/trading-simulator/ui';
import { switchMap } from 'rxjs';
import { PageTradingSimulatorBaseComponent } from '../base/page-trading-simulator-base.component';
import { PageTradingSimulatorDetailsButtonsComponent } from './components/page-trading-simulator-details-buttons/page-trading-simulator-details-buttons.component';
import { PageTradingSimulatorDetailsInfoComponent } from './components/page-trading-simulator-details-info/page-trading-simulator-details-info.component';
import { PageTradingSimulatorDetailsParticipantDataComponent } from './components/page-trading-simulator-details-participant-data/page-trading-simulator-details-participant-data.component';

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
    TradingSimulatorParticipantItemComponent,
    PortfolioTransactionsItemComponent,
    PageTradingSimulatorDetailsInfoComponent,
    GeneralCardComponent,
    SlicePipe,
    RangeDirective,
    DateReadablePipe,
    CurrencyPipe,
    PortfolioTransactionsTableComponent,
    PageTradingSimulatorDetailsParticipantDataComponent,
    NgClass,
    SortReversePipe,
  ],
  template: `
    @if (simulatorData(); as simulatorData) {
      <div class="mb-6 flex items-center justify-between">
        <app-section-title title="Simulator: {{ simulatorData.name }}" />

        <!-- buttons to the owner -->
        <app-page-trading-simulator-details-buttons [simulatorData]="simulatorData" />
      </div>

      <!-- participant data -->
      @if (participant(); as participant) {
        <div class="mb-6">
          <app-page-trading-simulator-details-participant-data
            [participant]="participant"
            [simulatorData]="simulatorData"
            [simulatorSymbols]="simulatorSymbols()"
            [symbolAggregations]="simulatorAggregationSymbols()"
          />
        </div>
      }

      <div class="mb-6 grid grid-cols-4 gap-x-10">
        <!-- left side -->
        <div class="col-span-3">
          <!-- symbol info -->
          <div class="mb-4 flex justify-between">
            <app-section-title
              title="Symbol Price Movement"
              titleSize="lg"
              description="Charts indicates how the prices of each symbol have changed over time."
            />

            <app-trading-simulator-symbol-price-chart-legend [isOwner]="isAuthUserOwner()" />
          </div>

          <!-- display charts of symbols -->
          <div class="mb-6 grid grid-cols-3 gap-x-6 gap-y-3">
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
            titleSize="lg"
          />
          <app-general-card>
            <app-trading-simulator-symbol-stat-table [data]="simulatorAggregationSymbols()" />
          </app-general-card>
        </div>

        <!-- right side -->
        <div>
          <!-- simulator info -->
          <app-page-trading-simulator-details-info [tradingSimulator]="simulatorData" />
        </div>
      </div>

      <!-- participant ranking -->
      <app-section-title title="Participant Ranking" matIcon="people" class class="mb-3" titleSize="lg" />
      <div class="flex flex-col gap-2">
        @if (participantRanking(); as participantRanking) {
          @for (participant of participantRanking; track participant.userData.id; let i = $index) {
            <app-trading-simulator-participant-item [participant]="participant" [position]="i + 1" />
          } @empty {
            <div class="p-4 text-center">No participants</div>
          }
        } @else {
          <div *ngRange="simulatorData.currentParticipants" class="g-skeleton h-10"></div>
        }
      </div>

      <!-- display participants -->
      <app-section-title title="Compare Participants" matIcon="people" class="mb-3" titleSize="lg" />
      TODO TODO

      <!-- display transactions -->
      <div class="grid grid-cols-3 gap-x-4">
        <app-portfolio-transactions-table
          [data]="simulatorAggregationTransactions()?.lastTransactions | sortReverse"
          [showSymbolFilter]="true"
          [pageSize]="15"
          [displayedColumns]="displayedColumnsTransactionTable"
          class="col-span-2"
        />

        <div class="grid gap-y-6 lg:pt-6">
          <!-- best transactions -->
          <app-general-card title="Best Returns" matIcon="trending_up" class="flex-1">
            @for (
              item of simulatorAggregationTransactions()?.bestTransactions | slice: 0 : 5;
              track item.transactionId;
              let last = $last
            ) {
              <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                <app-portfolio-transactions-item dateType="round" [transaction]="item" />
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
                <app-portfolio-transactions-item dateType="round" [transaction]="item" />
              </div>
            }
          </app-general-card>
        </div>
      </div>
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

  readonly participantRanking = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorAggregationParticipants(selectedId)),
    ),
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
