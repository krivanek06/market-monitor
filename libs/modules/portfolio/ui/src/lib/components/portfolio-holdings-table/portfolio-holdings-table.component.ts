import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-portfolio-holdings-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-holdings-table.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioHoldingsTableComponent {
  @Input({ required: true }) portfolioBalance!: number;
}
