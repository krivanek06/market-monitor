import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { Confirmable } from '@mm/shared/dialog-manager';
import { SectionTitleComponent } from '@mm/shared/ui';
import { TradingSimulatorFormComponent } from '@mm/trading-simulator/features';
import { PageTradingSimulatorBaseComponent } from '../base/page-trading-simulator-base.component';

@Component({
  selector: 'app-page-trading-simulator-edit',
  standalone: true,
  imports: [
    TradingSimulatorFormComponent,
    MatProgressSpinnerModule,
    SectionTitleComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    @if (formData(); as formData) {
      <!-- title -->
      <app-section-title title="Edit Trading Simulator" class="mb-4">
        <button (click)="onDelete()" type="button" mat-stroked-button color="warn">
          <mat-icon>delete</mat-icon>
          Delete Simulator
        </button>
      </app-section-title>

      <!-- trading simulator form -->
      <app-trading-simulator-form [existingTradingSimulator]="formData" />
    } @else {
      <div class="grid h-[600px] place-content-center">
        <mat-spinner diameter="100" />
      </div>
    }
  `,
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
    const simulatorSymbols = this.simulatorSymbols();

    console.log('simulatorSymbols', simulatorSymbols);

    if (!simulator || simulatorSymbols.length === 0) {
      return null;
    }

    return {
      simulator,
      simulatorSymbols,
    };
  });

  @Confirmable('Are you sure you want to delete this trading simulator?')
  async onDelete() {
    const simulator = this.simulatorData();

    if (!simulator) {
      return;
    }

    // notify user
    this.dialogServiceUtil.showNotificationBar('Deleting Trading Simulator...');

    try {
      // delete the trading simulator
      await this.tradingSimulatorService.deleteSimulator(simulator);

      // redirect to the trading simulator page
      await this.router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);

      // show a success message
      this.dialogServiceUtil.showNotificationBar('Trading Simulator Deleted', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }
}
