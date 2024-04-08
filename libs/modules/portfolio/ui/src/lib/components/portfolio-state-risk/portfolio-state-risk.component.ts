import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioRisk } from '@mm/api-types';
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
            {{ portfolioRisk()?.alpha ? (portfolioRisk()?.alpha | number: '1.2-2') + '%' : 'N/A' }}
          </div>
        </div>

        <!-- Volatility -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Volatility</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ portfolioRisk()?.volatility ? (portfolioRisk()?.volatility | percent: '1.2-2') : 'N/A' }}
          </div>
        </div>

        <!-- Beta -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Beta</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ portfolioRisk()?.beta ? (portfolioRisk()?.beta | number: '1.2-2') : 'N/A' }}
          </div>
        </div>

        <!-- Sharp Ratio -->
        <div class="flex justify-between @md:flex-col">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Sharp Ratio</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ portfolioRisk()?.sharpe ? (portfolioRisk()?.sharpe | number: '1.2-2') : 'N/A' }}
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
  portfolioRisk = input<PortfolioRisk | undefined | null>();
  titleColor = input<ColorScheme | undefined>();
  valueColor = input<ColorScheme | undefined>();
}
