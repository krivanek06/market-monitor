import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortfolioTransactionsItemComponent } from '@mm/portfolio/ui';
import { DateReadablePipe, GeneralCardComponent, RangeDirective, SectionTitleComponent } from '@mm/shared/ui';
import {
  TradingSimulatorParticipantCardComponent,
  TradingSimulatorParticipantItemComponent,
  TradingSimulatorSymbolPriceChartComponent,
  TradingSimulatorSymbolPriceChartLegendComponent,
  TradingSimulatorSymbolStatTableComponent,
} from '@mm/trading-simulator/ui';
import { switchMap } from 'rxjs';
import { PageTradingSimulatorBaseComponent } from '../base/page-trading-simulator-base.component';
import { PageTradingSimulatorStatisticsButtonsComponent } from './components/page-trading-simulator-statistics-buttons.component';

@Component({
  selector: 'app-page-trading-simulator-statistics',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    PageTradingSimulatorStatisticsButtonsComponent,
    SectionTitleComponent,
    TradingSimulatorSymbolPriceChartComponent,
    TradingSimulatorSymbolPriceChartLegendComponent,
    TradingSimulatorSymbolStatTableComponent,
    TradingSimulatorParticipantItemComponent,
    PortfolioTransactionsItemComponent,
    TradingSimulatorParticipantCardComponent,
    GeneralCardComponent,
    SlicePipe,
    RangeDirective,
    DateReadablePipe,
  ],
  template: `
    @if (simulatorData(); as simulatorData) {
      <div class="mb-6 grid grid-cols-4 gap-x-10">
        <!-- left side -->
        <div class="col-span-3">
          <div class="mb-6 flex items-center justify-between">
            <app-section-title title="Simulator Statistics: {{ simulatorData.name }}" />

            <!-- buttons to the owner -->
            <app-page-trading-simulator-statistics-buttons [simulatorData]="simulatorData" />
          </div>

          <!-- round info -->
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
                [currentRound]="simulatorData.currentRound"
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
          <!-- basic information -->
          <app-general-card class="mb-4" title="Basic Information">
            <div class="g-item-wrapper">
              <div>Current Round</div>
              <div>{{ simulatorData.currentRound }} / {{ simulatorData.maximumRounds }}</div>
            </div>

            <div class="g-item-wrapper">
              <div>Round Remaining</div>
              <div>4min 22 sec.</div>
            </div>

            <div class="g-item-wrapper">
              <div>Round Duration</div>
              <div>{{ simulatorData.oneRoundDurationMinutes | dateReadable: 'minutes' }}</div>
            </div>

            <div class="g-item-wrapper">
              <div>Total Participants</div>
              <div>{{ simulatorData.currentParticipants }}</div>
            </div>
          </app-general-card>

          <!-- participant ranking -->
          <app-section-title title="Participant Ranking" class="mb-3" titleSize="lg" />
          <div class="flex flex-col gap-2">
            @for (participant of topParticipants(); track participant.userData.id; let i = $index) {
              <app-trading-simulator-participant-item [participant]="participant" [position]="i + 1" />
            } @empty {
              <div *ngRange="simulatorData.currentParticipants" class="g-skeleton h-10"></div>
            }
          </div>
        </div>
      </div>

      <!-- display participants -->
      <app-section-title title="Top Participants" matIcon="people" class="mb-3" titleSize="lg" />
      <div class="mb-6 grid grid-cols-4 gap-x-6 gap-y-4">
        @for (participant of topParticipants() | slice: 0 : 8; track participant.userData.id; let i = $index) {
          <app-trading-simulator-participant-card [participant]="participant" [position]="i + 1" />
        }
      </div>

      <!-- display transactions -->
      <app-section-title title="Transaction History" matIcon="history" class="mb-3" titleSize="lg" />
      <div class="grid grid-cols-3 gap-x-4">
        <app-general-card title="Last Transactions"> </app-general-card>
        <app-general-card title="Best Transactions"> </app-general-card>
        <app-general-card title="Worst Transactions"> </app-general-card>
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
export class PageTradingSimulatorStatisticsComponent extends PageTradingSimulatorBaseComponent {
  readonly topParticipants = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorByIdTopParticipants(selectedId)),
    ),
  );
}
