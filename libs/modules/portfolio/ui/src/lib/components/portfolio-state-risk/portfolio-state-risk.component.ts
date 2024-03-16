import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioState } from '@mm/api-types';
import { ColorScheme } from '@mm/shared/data-access';
import { AddColorDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-state-risk',
  standalone: true,
  imports: [CommonModule, AddColorDirective],
  template: `
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- Alpha -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Alpha</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{
              portfolioState()?.portfolioRisk?.alpha
                ? (portfolioState()?.portfolioRisk?.alpha | number: '1.2-2') + '%'
                : 'N/A'
            }}
          </div>
        </div>

        <!-- Volatility -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Volatility</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{
              portfolioState()?.portfolioRisk?.volatility
                ? (portfolioState()?.portfolioRisk?.volatility | percent: '1.2-2')
                : 'N/A'
            }}
          </div>
        </div>

        <!-- Beta -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Beta</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{
              portfolioState()?.portfolioRisk?.beta ? (portfolioState()?.portfolioRisk?.beta | number: '1.2-2') : 'N/A'
            }}
          </div>
        </div>

        <!-- Sharp Ratio -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Sharp Ratio</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{
              portfolioState()?.portfolioRisk?.sharpe
                ? (portfolioState()?.portfolioRisk?.sharpe | number: '1.2-2')
                : 'N/A'
            }}
          </div>
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
  portfolioState = input<PortfolioState | undefined>();
  titleColor = input<ColorScheme | undefined>();
  valueColor = input<ColorScheme | undefined>();
}
