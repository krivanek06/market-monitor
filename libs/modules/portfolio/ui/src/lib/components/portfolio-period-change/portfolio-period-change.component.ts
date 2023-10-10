import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioChange } from '@market-monitor/modules/portfolio/data-access';
import { PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-period-change',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective],
  templateUrl: './portfolio-period-change.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioPeriodChangeComponent {
  @Input({ required: true }) portfolioChange!: PortfolioChange;
}
