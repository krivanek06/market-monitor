import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TradingSimulator } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN, ROUTES_TRADING_SIMULATOR } from '@mm/shared/data-access';
import { SectionTitleComponent } from '@mm/shared/ui';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';
import { TradingSimulatorDisplayCardComponent } from '@mm/trading-simulator/ui';

@Component({
  selector: 'app-page-trading-simulator',
  standalone: true,
  imports: [
    TradingSimulatorDisplayCardComponent,
    SectionTitleComponent,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <div class="mb-4 flex items-center justify-between">
      <app-section-title title="Trading Simulations" matIcon="sports_esports" />

      <!-- create button -->
      <button
        (click)="onCreateSimulator()"
        [disabled]="!userData().featureAccess?.createTradingSimulator"
        class="h-10"
        type="button"
        mat-stroked-button
        color="primary"
      >
        <mat-icon>add</mat-icon>
        create simulator
      </button>
    </div>

    <!-- simulators by the owner -->
    @if (userData().featureAccess?.createTradingSimulator) {
      <div class="mb-6">
        <app-section-title title="Owned Simulations" description="Simulators that you have created" class="mb-3" />
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          @for (item of simulatorsByOwner(); track item.id) {
            <app-trading-simulator-display-card
              (editClicked)="onEditSimulator(item)"
              (statsClicked)="onStatisticsClicked(item)"
              [tradingSimulator]="item"
              [authUser]="userData()"
            />
          }
        </div>
      </div>

      <div class="mb-6">
        <mat-divider />
      </div>
    }

    <!-- simulator the user is participating in -->
    @if ((simulatorsByParticipant()?.length ?? 0) > 0) {
      <div class="mb-6">
        <app-section-title title="My Simulations" description="Simulators that you are participating in" class="mb-3" />

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          @for (item of simulatorsByParticipant(); track item.id) {
            <app-trading-simulator-display-card
              (statsClicked)="onStatisticsClicked(item)"
              [tradingSimulator]="item"
              [authUser]="userData()"
            />
          }
        </div>
      </div>

      <div class="mb-6">
        <mat-divider />
      </div>
    }

    <!-- all running simulators -->
    <div class="mb-6">
      <app-section-title title="Running Simulators: {{ tradingSimulatorLatestData().started.length }}" class="mb-3" />

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (item of tradingSimulatorLatestData().started; track item.id) {
          <app-trading-simulator-display-card
            (statsClicked)="onStatisticsClicked(item)"
            [tradingSimulator]="item"
            [authUser]="userData()"
          />
        } @empty {
          <div class="p-6 text-center md:col-span-2 xl:col-span-3">No running simulators</div>
        }
      </div>
    </div>

    <div class="mb-6">
      <mat-divider />
    </div>

    <!-- all live simulators -->
    <div class="mb-6">
      <app-section-title title="Upcoming Simulators: {{ tradingSimulatorLatestData().live.length }}" class="mb-3" />

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (item of tradingSimulatorLatestData().live; track item.id) {
          <app-trading-simulator-display-card
            (statsClicked)="onStatisticsClicked(item)"
            [tradingSimulator]="item"
            [authUser]="userData()"
          />
        } @empty {
          <div class="p-6 text-center md:col-span-2 xl:col-span-3">No upcoming simulators</div>
        }
      </div>
    </div>

    @if (tradingSimulatorLatestData().historical.length > 0) {
      <div class="mb-6">
        <mat-divider />
      </div>

      <!-- historical simulators -->
      <div class="mb-6">
        <app-section-title title="Ended Simulators" class="mb-3" />

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          @for (item of tradingSimulatorLatestData().historical; track item.id) {
            <app-trading-simulator-display-card
              (statsClicked)="onStatisticsClicked(item)"
              [tradingSimulator]="item"
              [authUser]="userData()"
            />
          }
        </div>
      </div>
    }
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
  private readonly router = inject(Router);

  readonly simulatorsByOwner = this.tradingSimulatorService.simulatorsByOwner;
  readonly simulatorsByParticipant = this.tradingSimulatorService.simulatorsByParticipant;
  readonly userData = this.authenticationUserStoreService.state.getUserData;
  readonly tradingSimulatorLatestData = this.tradingSimulatorService.tradingSimulatorLatestData;

  onCreateSimulator() {
    this.router.navigate([ROUTES_MAIN.TRADING_SIMULATOR, ROUTES_TRADING_SIMULATOR.CREATE]);
  }

  onEditSimulator(simulator: TradingSimulator) {
    this.router.navigate([ROUTES_MAIN.TRADING_SIMULATOR, ROUTES_TRADING_SIMULATOR.EDIT, simulator.id]);
  }

  onStatisticsClicked(simulator: TradingSimulator) {
    this.router.navigate([ROUTES_MAIN.TRADING_SIMULATOR, ROUTES_TRADING_SIMULATOR.DETAILS, simulator.id]);
  }
}
