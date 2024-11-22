import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SectionTitleComponent } from '@mm/shared/ui';
import { PageTradingSimulatorBaseComponent } from '../base/page-trading-simulator-base.component';
import { PageTradingSimulatorStatisticsButtonsComponent } from './components/page-trading-simulator-statistics-buttons.component';

@Component({
  selector: 'app-page-trading-simulator-statistics',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, PageTradingSimulatorStatisticsButtonsComponent, SectionTitleComponent],
  template: `
    <div class="flex items-center justify-between">
      <app-section-title title="Simulator Statistics: {{ simulatorData()?.name }}" />

      <!-- buttons to the owner -->
      @if (isAuthUserOwner()) {
        @if (simulatorData(); as simulatorData) {
          <app-page-trading-simulator-statistics-buttons [simulatorData]="simulatorData" />
        }
      }
    </div>

   <!-- display charts of symbols -->


   <!-- display participants -->
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorStatisticsComponent extends PageTradingSimulatorBaseComponent {}
