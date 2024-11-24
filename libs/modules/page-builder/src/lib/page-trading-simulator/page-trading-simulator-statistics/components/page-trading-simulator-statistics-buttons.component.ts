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
          @if (isAuthUserOwner()) {
            <!-- start button -->
            <button mat-stroked-button type="button" color="accent" (click)="onStart()">
              <mat-icon iconPositionEnd>play_arrow</mat-icon>
              Start
            </button>
          } @else {
            @if (!isUserJoined()) {
              <!-- join -->
              <button (click)="onJoin()" mat-stroked-button type="button" color="accent">Join Simulator</button>
            } @else {
              <!-- leave -->
              <button (click)="onLeave()" mat-stroked-button type="button" color="warn">Leave Simulator</button>
            }
          }
        }
        @case ('started') {
          @if (isAuthUserOwner()) {
            <!-- finish button -->
            <button mat-stroked-button type="button" color="warn" (click)="onFinish()">
              <mat-icon iconPositionEnd>stop</mat-icon>
              Finish
            </button>
          }
        }
        @case ('finished') {
          @if (isAuthUserOwner()) {
            <!-- delete button -->
            <button mat-stroked-button type="button" color="warn" (click)="onDelete()">
              <mat-icon iconPositionEnd>delete</mat-icon>
              Delete
            </button>
          }
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
  readonly isUserJoined = computed(() =>
    this.simulatorData().participants.includes(this.authenticationUserStoreService.state.getUserData().id),
  );

  @Confirmable('Are you sure you want to start the simulator?')
  onStart() {
    try {
      // start the simulator
      this.tradingSimulatorService.simulatorStateChangeStart(this.simulatorData());

      // notify user
      this.dialogServiceUtil.showNotificationBar('Simulator started', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to finish the simulator?')
  onFinish() {
    try {
      // finish the simulator
      this.tradingSimulatorService.simulatorStateChangeFinish(this.simulatorData());

      // notify user
      this.dialogServiceUtil.showNotificationBar('Simulator finished', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
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

  async onJoin() {
    const invitationCode =
      this.simulatorData().invitationCode !== ''
        ? await this.dialogServiceUtil.showInlineInputDialog({
            title: 'Add Invitation Code',
            description: 'Enter the invitation code to join the trading simulator',
          })
        : '';

    // allow sending empty string - then simulator is open for everyone
    if (invitationCode === null || invitationCode === undefined) {
      return;
    }

    try {
      this.dialogServiceUtil.showNotificationBar('You are joining the simulator');
      await this.tradingSimulatorService.joinSimulator(this.simulatorData(), invitationCode);
      this.dialogServiceUtil.showNotificationBar('You have joined the simulator', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Please confirm leaving the simulator')
  onLeave() {
    this.tradingSimulatorService.leaveSimulator(this.simulatorData());
    this.dialogServiceUtil.showNotificationBar('You have left the simulator', 'success');
  }
}
