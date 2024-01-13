import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { AddColorDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state-risk',
  standalone: true,
  imports: [CommonModule, AddColorDirective],
  template: `
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- Alpha -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="text-lg">Alpha</div>
          <div [appAddColor]="valueColor" class="text-lg">N/A</div>
        </div>

        <!-- Beta -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="text-lg">Beta</div>
          <div [appAddColor]="valueColor" class="text-lg">N/A</div>
        </div>

        <!-- Sharp Ratio -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="text-lg">Sharp Ratio</div>
          <div [appAddColor]="valueColor" class="text-lg">N/A</div>
        </div>

        <!-- Volatility -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor" class="text-lg">Volatility</div>
          <div [appAddColor]="valueColor" class="text-lg">N/A</div>
        </div>
      </div>
    </div>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioStateRiskComponent {
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;
}
