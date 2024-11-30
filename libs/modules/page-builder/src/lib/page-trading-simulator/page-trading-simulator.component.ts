import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
    <div class="grid gap-6">
      <!-- user has privileges -->

      @if (userData().featureAccess?.createTradingSimulator) {
        <div>
          <div class="mb-4 flex items-center justify-between">
            <app-section-title title="My Created Simulations" />

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

          <!-- simulators by the owner -->
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

        <div>
          <mat-divider />
        </div>
      }

      <!-- simulator the user is participating in -->
      @if ((simulatorsByParticipant()?.length ?? 0) > 0) {
        <div>
          <app-section-title title="My Simulations" class="mb-3" titleSize="lg" />

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

        <div>
          <mat-divider />
        </div>
      }

      <!-- all running simulators -->
      <div>
        <app-section-title
          title="Running Simulators: {{ tradingSimulatorLatestData().started.length }}"
          class="mb-3"
          titleSize="lg"
        />

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          @for (item of tradingSimulatorLatestData().started; track item.id) {
            <app-trading-simulator-display-card
              (statsClicked)="onStatisticsClicked(item)"
              [tradingSimulator]="item"
              [authUser]="userData()"
            />
          } @empty {
            <div class="p-6 text-center">No running simulators</div>
          }
        </div>
      </div>

      <div>
        <mat-divider />
      </div>

      <!-- all live simulators -->
      <div>
        <app-section-title
          title="Upcoming Simulators: {{ tradingSimulatorLatestData().live.length }}"
          class="mb-3"
          titleSize="lg"
        />

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          @for (item of tradingSimulatorLatestData().live; track item.id) {
            <app-trading-simulator-display-card
              (statsClicked)="onStatisticsClicked(item)"
              [tradingSimulator]="item"
              [authUser]="userData()"
            />
          } @empty {
            <div class="p-6 text-center">No upcoming simulators</div>
          }
        </div>
      </div>

      @if (tradingSimulatorLatestData().historical.length > 0) {
        <div>
          <mat-divider />
        </div>

        <!-- historical simulators -->
        <div>
          <app-section-title title="Ended Simulators" class="mb-3" titleSize="lg" />

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
  private readonly router = inject(Router);

  readonly simulatorsByOwner = this.tradingSimulatorService.simulatorsByOwner;
  readonly simulatorsByParticipant = this.tradingSimulatorService.simulatorByParticipant;
  readonly userData = this.authenticationUserStoreService.state.getUserData;
  readonly tradingSimulatorLatestData = this.tradingSimulatorService.tradingSimulatorLatestData;

  readonly isCreatingSimulatorEnabled = computed(
    () =>
      // check if user has permissions to create a new simulator
      this.userData().featureAccess?.createTradingSimulator,
  );

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
