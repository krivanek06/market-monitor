import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColorScheme } from '@mm/shared/data-access';

@Component({
  selector: 'app-trading-simulator-symbol-price-chart-legend',
  standalone: true,
  imports: [MatTooltipModule],
  template: `
    <div class="flex items-center gap-x-4">
      <!-- point -->
      <div matTooltip="This price is visible to all users who inspect the simulator" class="flex items-center gap-1">
        <div class="h-6 w-6 rounded-full" [style.background-color]="ColorScheme.ACCENT_1_VAR"></div>
        <div class="text-wt-gray-dark">Historical Price</div>
      </div>

      <!-- point -->
      @if (isOwner()) {
        <div matTooltip="This price is visible only to the owner to the simulator" class="flex items-center gap-1">
          <div class="h-6 w-6 rounded-full" [style.background-color]="ColorScheme.ACCENT_2_VAR"></div>
          <div class="text-wt-gray-dark">Future Price</div>
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
export class TradingSimulatorSymbolPriceChartLegendComponent {
  readonly isOwner = input<boolean>(false);
  readonly ColorScheme = ColorScheme;
}
