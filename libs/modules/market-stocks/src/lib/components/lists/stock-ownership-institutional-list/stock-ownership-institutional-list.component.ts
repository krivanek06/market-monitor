import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnterpriseValue, SymbolOwnershipInstitutional } from '@market-monitor/api-types';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';
import { LargeNumberFormatterPipe } from '@market-monitor/shared-pipes';

@Component({
  selector: 'app-stock-ownership-institutional-list',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  templateUrl: './stock-ownership-institutional-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockOwnershipInstitutionalListComponent {
  /**
   * both inputs are associated with the same quarterly data
   */
  @Input({ required: true }) ownershipInstitutional!: SymbolOwnershipInstitutional;
  @Input({ required: true }) enterpriseValue!: EnterpriseValue;
  @Input() displayType: 'institution' | 'position' | 'option' = 'institution';
}
