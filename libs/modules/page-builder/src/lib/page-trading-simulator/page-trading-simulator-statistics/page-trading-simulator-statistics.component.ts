import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortfolioTransactionsItemComponent } from '@mm/portfolio/ui';
import { GeneralCardComponent, SectionTitleComponent } from '@mm/shared/ui';
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
  ],
  template: `
    <div class="mb-6 grid grid-cols-4 gap-x-10">
      <div class="col-span-3">
        <div class="mb-6 flex items-center justify-between">
          <app-section-title title="Simulator Statistics: {{ simulatorData()?.name }}" />

          <!-- buttons to the owner -->
          @if (isAuthUserOwner()) {
            @if (simulatorData(); as simulatorData) {
              <app-page-trading-simulator-statistics-buttons [simulatorData]="simulatorData" />
            }
          }
        </div>

        <!-- round info -->
        <div class="mb-4 flex justify-between">
          <div>Current Round: {{ simulatorData()?.currentRound }}</div>

          <app-trading-simulator-symbol-price-chart-legend [isOwner]="isAuthUserOwner()" />
        </div>

        <!-- display charts of symbols -->
        @if (simulatorData(); as simulatorData) {
          <div class="mb-6 grid grid-cols-3 gap-x-6 gap-y-3">
            @for (symbol of simulatorSymbols(); track symbol.symbol) {
              <app-trading-simulator-symbol-price-chart
                [simulator]="simulatorData"
                [simulatorSymbol]="symbol"
                [currentRound]="simulatorData.currentRound"
                [authUser]="authUserData()"
                [heightPx]="185"
              />
            }
          </div>
        }

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
        <app-section-title title="Participant Ranking" class="mb-3" titleSize="lg" />
        <div class="flex flex-col gap-2">
          @for (participant of topParticipants(); track participant.userData.id; let i = $index) {
            <app-trading-simulator-participant-item [participant]="participant" [position]="i + 1" />
          }
        </div>
      </div>
    </div>

    <!-- display participants -->
    <app-section-title title="Top Participants" matIcon="people" class="mb-3" />
    <div class="mb-6 grid grid-cols-4 gap-x-6 gap-y-4">
      @for (participant of topParticipants() | slice: 0 : 8; track participant.userData.id; let i = $index) {
        <app-trading-simulator-participant-card [participant]="participant" [position]="i + 1" />
      }
    </div>

    <!-- display transactions -->
    <app-section-title title="Transaction History" matIcon="history" class="mb-3" />
    <div class="grid grid-cols-3 gap-x-4">
      <app-general-card title="Last Transactions"> </app-general-card>
      <app-general-card title="Best Transactions"> </app-general-card>
      <app-general-card title="Worst Transactions"> </app-general-card>
    </div>
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
