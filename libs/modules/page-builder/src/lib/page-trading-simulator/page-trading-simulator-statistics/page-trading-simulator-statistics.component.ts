import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SectionTitleComponent } from '@mm/shared/ui';
import {
  TradingSimulatorSymbolPriceChartComponent,
  TradingSimulatorSymbolPriceChartLegendComponent,
} from '@mm/trading-simulator/ui';
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
  ],
  template: `
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
      <div>Current Round: {{ simulatorCurrentRound() }}</div>

      <app-trading-simulator-symbol-price-chart-legend [isOwner]="isAuthUserOwner()" />
    </div>

    <!-- display charts of symbols -->
    @if (simulatorData(); as simulatorData) {
      <div class="grid grid-cols-3 gap-x-6 gap-y-3">
        @for (symbol of simulatorSymbols(); track symbol.symbol) {
          <app-trading-simulator-symbol-price-chart
            [simulator]="simulatorData"
            [simulatorSymbol]="symbol"
            [currentRound]="simulatorCurrentRound()"
            [authUser]="authUserData()"
            [heightPx]="225"
          />
        }
      </div>
    }

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
export class PageTradingSimulatorStatisticsComponent extends PageTradingSimulatorBaseComponent {}
