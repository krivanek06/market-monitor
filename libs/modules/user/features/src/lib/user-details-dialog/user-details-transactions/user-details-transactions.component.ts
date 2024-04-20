import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortfolioTransaction } from '@mm/api-types';
import { PortfolioTransactionsTableComponent } from '@mm/portfolio/ui';
import { SectionTitleComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-user-details-transactions',
  standalone: true,
  imports: [CommonModule, PortfolioTransactionsTableComponent, SectionTitleComponent],
  template: `
    <app-section-title title="Transactions" class="mb-3" />
    <app-portfolio-transactions-table [data]="portfolioTransaction()" />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsTransactionsComponent {
  portfolioTransaction = input.required<PortfolioTransaction[]>();
}
