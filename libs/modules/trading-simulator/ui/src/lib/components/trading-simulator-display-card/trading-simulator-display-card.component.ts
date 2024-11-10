import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TradingSimulator } from '@mm/api-types';
import { GeneralCardActionContentDirective, GeneralCardComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-trading-simulator-display-card',
  standalone: true,
  imports: [GeneralCardComponent, MatButtonModule, MatIconModule, GeneralCardActionContentDirective],
  template: `
    <app-general-card [title]="tradingSimulator().name">
      <div>test body</div>

      <!-- action buttons -->
      <ng-template appGeneralCardActionContent>
        <div class="flex justify-end gap-4">
          <button mat-button type="button">Edit</button>
        </div>
      </ng-template>
    </app-general-card>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorDisplayCardComponent {
  readonly tradingSimulator = input.required<TradingSimulator>();
}
