import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PortfolioStateHolding } from '@market-monitor/api-types';
import { PortfolioHoldingsTableComponent } from '@market-monitor/modules/portfolio/ui';
import { SectionTitleComponent } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-user-details-holdings',
  imports: [CommonModule, PortfolioHoldingsTableComponent, SectionTitleComponent],
  template: `
    <div class="p-4">
      <app-portfolio-holdings-table
        [holdings]="holdings"
        [holdingsBalance]="holdingsBalance"
        [displayedColumns]="displayedColumns"
      ></app-portfolio-holdings-table>
    </div>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsHoldingsComponent {
  @Input({ required: true }) holdingsBalance!: number;
  @Input({ required: true }) holdings!: PortfolioStateHolding[];

  displayedColumns: string[] = ['symbol', 'price', 'balance', 'invested', 'totalChange', 'portfolio'];
}
