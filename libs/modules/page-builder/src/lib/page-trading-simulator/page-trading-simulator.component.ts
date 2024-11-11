import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TradingSimulator } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN, ROUTES_TRADING_SIMULATOR } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
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
        <app-section-title title="My Simulations" class="mb-4" />

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
  private readonly tradingSimulatorFacadeService = inject(TradingSimulatorFacadeService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly router = inject(Router);

  readonly mySimulations = this.tradingSimulatorFacadeService.authUserTradingSimulatorOwner;
  readonly userData = this.authenticationUserStoreService.state.getUserData;

  async onJoinSimulator(simulator: TradingSimulator) {
    const invitationCode = await this.dialogServiceUtil.showInlineInputDialog({
      title: 'Add Invitation Code',
      description: 'Enter the invitation code to join the trading simulator',
    });

    if (!invitationCode) {
      return;
    }

    console.log('invitationCode', invitationCode);

    if (invitationCode !== simulator.invitationCode) {
      this.dialogServiceUtil.showNotificationBar('Invalid invitation code', 'error');
      return;
    }

    // todo join simulator
  }

  async onLeaveSimulator(simulator: TradingSimulator) {
    if (!(await this.dialogServiceUtil.showConfirmDialog('Are you sure you want to leave this trading simulator?'))) {
      return;
    }

    console.log('leaving simulator', simulator);

    // todo leave simulator
  }

  onVisitSimulator(simulator: TradingSimulator) {
    this.router.navigateByUrl(`${ROUTES_MAIN.TRADING_SIMULATOR}/${ROUTES_TRADING_SIMULATOR.DETAILS}/${simulator.id}`);
  }

  onEditSimulator(simulator: TradingSimulator) {
    this.router.navigateByUrl(`${ROUTES_MAIN.TRADING_SIMULATOR}/${ROUTES_TRADING_SIMULATOR.EDIT}/${simulator.id}`);
  }
}
