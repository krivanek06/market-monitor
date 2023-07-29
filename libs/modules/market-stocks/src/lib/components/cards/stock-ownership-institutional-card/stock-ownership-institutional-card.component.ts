import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnterpriseValue, SymbolOwnershipInstitutional } from '@market-monitor/api-types';
import { GeneralCardComponent } from '@market-monitor/shared-components';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';
import { LargeNumberFormatterPipe } from '@market-monitor/shared-pipes';

@Component({
  selector: 'app-stock-ownership-institutional-card',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, GeneralCardComponent, LargeNumberFormatterPipe],
  templateUrl: './stock-ownership-institutional-card.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockOwnershipInstitutionalCardComponent {
  /**
   * both inputs are associated with the same quarterly data
   */
  @Input({ required: true }) ownershipInstitutional!: SymbolOwnershipInstitutional;
  @Input({ required: true }) enterpriseValue!: EnterpriseValue;
}
