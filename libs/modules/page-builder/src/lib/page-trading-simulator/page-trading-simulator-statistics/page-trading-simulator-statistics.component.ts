import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SectionTitleComponent } from '@mm/shared/ui';
import {
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
  ],
  template: `
    <div class="grid grid-cols-4 gap-x-10">
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
                [heightPx]="200"
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
        <app-trading-simulator-symbol-stat-table [data]="simulatorAggregationSymbols()" />
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

    <!-- display transactions -->
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
