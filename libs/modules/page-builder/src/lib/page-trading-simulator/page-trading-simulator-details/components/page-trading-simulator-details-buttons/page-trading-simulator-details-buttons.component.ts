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
  selector: 'app-page-trading-simulator-details-buttons',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="flex justify-end gap-x-4">
      @switch (simulatorData().state) {
        @case ('live') {
          @if (isAuthUserOwner()) {
            <!-- draft -->
            <button (click)="onDraft()" mat-stroked-button color="warn" type="button">Change to Draft</button>

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
            <!-- next round -->
            <button mat-stroked-button type="button" color="primary" (click)="onNextRound()">
              <mat-icon iconPositionEnd>arrow_forward_ios</mat-icon>
              Next Round
            </button>

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
export class PageTradingSimulatorDetailsButtonsComponent {
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

  @Confirmable('Are you sure you want to finish the simulator?', 'Finish', true, 'FINISH')
  async onFinish() {
    try {
      // notify user
      this.dialogServiceUtil.showNotificationBar('Finishing the simulator, wait for the process to complete...');

      // finish the simulator
      await this.tradingSimulatorService.simulatorStateChangeFinish(this.simulatorData());

      // notify user
      this.dialogServiceUtil.showNotificationBar('Simulator finished', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Are you sure you want to delete the simulator?', 'Delete', true, 'DELETE')
  async onDelete() {
    // notify user
    this.dialogServiceUtil.showNotificationBar('Deleting Trading Simulator...');

    try {
      // delete the simulator
      await this.tradingSimulatorService.deleteSimulator(this.simulatorData());

      // navigate to the trading simulator page
      this.router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);

      // notify user
      this.dialogServiceUtil.showNotificationBar('Trading Simulator Deleted', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  @Confirmable('Changing to draft you can configure the simulator, but it will be hidden for users')
  onDraft() {
    this.tradingSimulatorService.simulatorStateChangeDraft(this.simulatorData());
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

  @Confirmable('Please confirm leaving the simulator', 'Confirm', true, 'LEAVE')
  async onLeave() {
    try {
      this.dialogServiceUtil.showNotificationBar('You are leaving the simulator');
      await this.tradingSimulatorService.leaveSimulator(this.simulatorData());
      this.dialogServiceUtil.showNotificationBar('You have left the simulator', 'success');
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  async onNextRound() {
    const message = `Confirm going to round: ${this.simulatorData().currentRound + 1}`;
    if (!(await this.dialogServiceUtil.showConfirmDialog(message))) {
      return;
    }

    this.dialogServiceUtil.showNotificationBar('Incrementing next round...');
    await this.tradingSimulatorService.incrementToNextRound(this.simulatorData());
    this.dialogServiceUtil.showNotificationBar('Next round started', 'success');
  }
}
