import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioState } from '@market-monitor/modules/portfolio/data-access';
import { PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective],
  templateUrl: './portfolio-state.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioStateComponent {
  @Input({ required: true }) portfolioState!: PortfolioState;
  @Input() isPortfolioCashActive: boolean = false;
}
