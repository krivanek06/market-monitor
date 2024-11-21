import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TradingSimulator } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN, ROUTES_TRADING_SIMULATOR } from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil } from '@mm/shared/dialog-manager';
import { SectionTitleComponent } from '@mm/shared/ui';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';
import { TradingSimulatorDisplayCardComponent } from '@mm/trading-simulator/ui';

@Component({
  selector: 'app-page-trading-simulator',
  standalone: true,
  imports: [TradingSimulatorDisplayCardComponent, SectionTitleComponent, MatButtonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-3 gap-x-10">
      <div class="col-span-2">
        <div class="flex items-center justify-between">
          <app-section-title title="My Simulations" class="mb-4" />

          <!-- create button -->
          <button
            (click)="onCreateSimulator()"
            [disabled]="!isCreatingSimulatorEnabled()"
            class="h-10"
            type="button"
            mat-stroked-button
            color="primary"
          >
            <mat-icon>add</mat-icon>
            create simulator
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          @for (item of mySimulations(); track item.id) {
            <app-trading-simulator-display-card
              (editClicked)="onEditSimulator(item)"
              (leaveClicked)="onLeaveSimulator(item)"
              (joinClicked)="onJoinSimulator(item)"
              (visitClicked)="onVisitSimulator(item)"
              [tradingSimulator]="item"
              [authUser]="userData()"
            />
          }
        </div>
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
  private readonly tradingSimulatorService = inject(TradingSimulatorService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly router = inject(Router);

  readonly mySimulations = this.tradingSimulatorService.simulatorsByOwner;
  readonly userData = this.authenticationUserStoreService.state.getUserData;

  readonly isCreatingSimulatorEnabled = computed(
    () =>
      // check if user has permissions to create a new simulator
      this.userData().featureAccess?.createTradingSimulator,
  );

  async onJoinSimulator(simulator: TradingSimulator) {
    const invitationCode = await this.dialogServiceUtil.showInlineInputDialog({
      title: 'Add Invitation Code',
      description: 'Enter the invitation code to join the trading simulator',
    });

    if (!invitationCode) {
      return;
    }

    this.tradingSimulatorService.joinSimulator(simulator, invitationCode);
  }

  @Confirmable('Are you sure you want to leave this trading simulator?')
  onLeaveSimulator(simulator: TradingSimulator) {
    this.tradingSimulatorService.leaveSimulator(simulator);
  }

  onVisitSimulator(simulator: TradingSimulator) {
    this.router.navigateByUrl(`${ROUTES_MAIN.TRADING_SIMULATOR}/${ROUTES_TRADING_SIMULATOR.DETAILS}/${simulator.id}`);
  }

  onEditSimulator(simulator: TradingSimulator) {
    this.router.navigateByUrl(`${ROUTES_MAIN.TRADING_SIMULATOR}/${ROUTES_TRADING_SIMULATOR.EDIT}/${simulator.id}`);
  }

  onCreateSimulator() {
    this.router.navigateByUrl(`${ROUTES_MAIN.TRADING_SIMULATOR}/${ROUTES_TRADING_SIMULATOR.CREATE}`);
  }
}
