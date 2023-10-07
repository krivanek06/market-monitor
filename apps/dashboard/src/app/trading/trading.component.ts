import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PortfolioStateComponent } from '@market-monitor/modules/portfolio/ui';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [CommonModule, PortfolioStateComponent],
  templateUrl: './trading.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingComponent {}
