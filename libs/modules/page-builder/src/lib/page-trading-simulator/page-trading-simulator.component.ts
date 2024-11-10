import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { SectionTitleComponent } from '@mm/shared/ui';
import { TradingSimulatorFacadeService } from '@mm/trading-simulator/data-access';
import { TradingSimulatorDisplayCardComponent } from '@mm/trading-simulator/ui';

@Component({
  selector: 'app-page-trading-simulator',
  standalone: true,
  imports: [TradingSimulatorDisplayCardComponent, SectionTitleComponent],
  template: `
    <div class="grid grid-cols-3 gap-x-10">
      <div class="col-span-2">
        <app-section-title title="My Simulations" />

        @for (item of mySimulations(); track item.id) {
          <app-trading-simulator-display-card [tradingSimulator]="item" />
        }
      </div>

      <div>right side</div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorComponent {
  private readonly tradingSimulatorFacadeService = inject(TradingSimulatorFacadeService);

  readonly mySimulations = this.tradingSimulatorFacadeService.authUserTradingSimulatorOwner;

  adad = effect(() => console.log('aaaaa', this.tradingSimulatorFacadeService.authUserTradingSimulatorOwner()));
}
