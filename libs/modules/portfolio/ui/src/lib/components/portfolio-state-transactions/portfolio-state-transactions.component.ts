import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioState } from '@market-monitor/modules/portfolio/data-access';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { AddColorDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state-transactions',
  standalone: true,
  imports: [CommonModule, AddColorDirective],
  templateUrl: './portfolio-state-transactions.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioStateTransactionsComponent {
  @Input({ required: true }) portfolioState!: PortfolioState;
  @Input() showFees = false;
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;
}
