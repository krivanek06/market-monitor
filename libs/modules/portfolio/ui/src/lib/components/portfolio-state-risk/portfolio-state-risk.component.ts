import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioRisk } from '@mm/api-types';
import { ColorScheme } from '@mm/shared/data-access';
import { AddColorDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-state-risk',
  standalone: true,
  imports: [AddColorDirective, DecimalPipe, PercentPipe],
  template: `
    <div class="@container">
      <div class="@lg:w-full @md:grid @md:grid-cols-2 gap-4">
        <!-- Alpha -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Alpha</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ (portfolioRisk()?.alpha | number: '1.2-2') + '%' }}
          </div>
        </div>

        <!-- Volatility -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Volatility</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ portfolioRisk()?.volatility | percent: '1.2-2' }}
          </div>
        </div>

        <!-- Beta -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Beta</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ portfolioRisk()?.beta | number: '1.2-2' }}
          </div>
        </div>

        <!-- Sharp Ratio -->
        <div class="@md:flex-col flex justify-between">
          <div [appAddColor]="titleColor()" class="sm:text-lg">Sharp Ratio</div>
          <div [appAddColor]="valueColor()" class="sm:text-lg">
            {{ portfolioRisk()?.sharpe | number: '1.2-2' }}
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
  readonly portfolioRisk = input<PortfolioRisk | undefined | null>();
  readonly titleColor = input<ColorScheme | undefined>();
  readonly valueColor = input<ColorScheme | undefined>();
}
