import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TradingSimulator } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil } from '@mm/shared/dialog-manager';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';

@Component({
  selector: 'app-page-trading-simulator-statistics-buttons',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="flex justify-end gap-x-4">
      @switch (simulatorData().state) {
        @case ('live') {
          <!-- start button -->
          <button mat-stroked-button type="button" color="accent" (click)="onStart()">
            <mat-icon iconPositionEnd>play_arrow</mat-icon>
            Start
          </button>
        }
        @case ('started') {
          <!-- finish button -->
          <button mat-stroked-button type="button" color="warn" (click)="onFinish()">
            <mat-icon iconPositionEnd>stop</mat-icon>
            Finish
          </button>
        }
        @case ('finished') {
          <!-- delete button -->
          <button mat-stroked-button type="button" color="warn" (click)="onDelete()">
            <mat-icon iconPositionEnd>delete</mat-icon>
            Delete
          </button>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorStatisticsButtonsComponent {
  protected readonly tradingSimulatorService = inject(TradingSimulatorService);
  protected readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  protected readonly dialogServiceUtil = inject(DialogServiceUtil);
  protected readonly router = inject(Router);

  readonly simulatorData = input.required<TradingSimulator>();
  readonly isAuthUserOwner = computed(
    () => this.simulatorData()?.owner.id === this.authenticationUserStoreService.state.getUserData().id,
  );

  @Confirmable('Are you sure you want to start the simulator?')
  onStart() {
    // start the simulator
    this.tradingSimulatorService.simulatorStateChangeStart(this.simulatorData());

    // notify user
    this.dialogServiceUtil.showNotificationBar('Simulator started', 'success');
  }

  @Confirmable('Are you sure you want to finish the simulator?')
  onFinish() {
    // finish the simulator
    this.tradingSimulatorService.simulatorStateChangeFinish(this.simulatorData());

    // notify user
    this.dialogServiceUtil.showNotificationBar('Simulator finished', 'success');
  }

  @Confirmable('Are you sure you want to delete the simulator?')
  onDelete() {
    // delete the simulator
    this.tradingSimulatorService.deleteSimulator(this.simulatorData());

    // navigate to the trading simulator page
    this.router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);

    // notify user
    this.dialogServiceUtil.showNotificationBar('Simulator deleted');
  }
}
