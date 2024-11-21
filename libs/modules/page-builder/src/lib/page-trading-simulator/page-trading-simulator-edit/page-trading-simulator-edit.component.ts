import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ROUTES_TRADING_SIMULATOR } from '@mm/shared/data-access';
import { SectionTitleComponent } from '@mm/shared/ui';
import { TradingSimulatorFormComponent } from '@mm/trading-simulator/features';
import { PageTradingSimulatorBaseComponent } from '../base/page-trading-simulator-base.component';

@Component({
  selector: 'app-page-trading-simulator-edit',
  standalone: true,
  imports: [TradingSimulatorFormComponent, MatProgressSpinnerModule, SectionTitleComponent],
  template: ` @if (displayForm()) {
      @if (formData(); as formData) {
        <!-- title -->
        <app-section-title title="Edit Trading Simulator" class="mb-4" />

        <!-- trading simulator form -->
        <app-trading-simulator-form [existingTradingSimulator]="formData" />
      }
    } @else {
      <div class="grid h-[600px] place-content-center">
        <mat-spinner diameter="100" />
      </div>
    }`,
  styles: `
    :host {
      display: block;
      max-width: 1320px;
      margin: 0 auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorEditComponent extends PageTradingSimulatorBaseComponent {
  readonly formData = computed(() => {
    const simulator = this.simulatorData();
    const simulatorSymbols = this.simulatorDataSymbols();

    if (!simulator || !simulatorSymbols) {
      return null;
    }

    return {
      simulator,
      simulatorSymbols,
    };
  });

  /** check if user is the owner */
  readonly displayForm = computed(() => {
    const user = this.authenticationUserStoreService.state.getUser();
    const simulator = this.simulatorData();

    // data not loaded
    if (!user || !simulator) {
      return false;
    }

    // user is the owner
    if (user.uid === simulator.owner.id) {
      return true;
    }

    // user is not the owner
    this.router.navigate([ROUTES_TRADING_SIMULATOR]);
    this.dialogServiceUtil.showNotificationBar('You are not the owner of this simulator', 'error');
    return false;
  });
}
