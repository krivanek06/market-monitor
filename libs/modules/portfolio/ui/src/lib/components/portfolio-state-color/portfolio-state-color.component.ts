import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioState } from '@market-monitor/modules/portfolio/data-access';
import { AddColorDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state-color',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, AddColorDirective],
  templateUrl: './portfolio-state-color.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioStateColorComponent {
  @Input({ required: true }) portfolioState!: PortfolioState;
  @Input() isPortfolioCashActive: boolean = false;
  @Input() titleColor?: string;
}
