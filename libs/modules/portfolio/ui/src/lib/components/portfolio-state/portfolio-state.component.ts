import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioState } from '@market-monitor/api-types';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { AddColorDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, AddColorDirective],
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
  @Input() classes = 'grid gap-4 sm:grid-cols-2';
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;

  @Input() showCashSegment = false;
}
