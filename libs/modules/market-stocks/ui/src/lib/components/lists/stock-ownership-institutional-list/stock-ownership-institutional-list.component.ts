import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnterpriseValue, SymbolOwnershipInstitutional } from '@market-monitor/api-types';
import { LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-ownership-institutional-list',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  templateUrl: './stock-ownership-institutional-list.component.html',
  styles: `
      :host {
        display: block;
      }

      .c-loading-wrapper {
        width: 45%;
        margin-right: 24px;
        height: 28px;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockOwnershipInstitutionalListComponent {
  /**
   * both inputs are associated with the same quarterly data
   */
  @Input({ required: true }) ownershipInstitutional?: SymbolOwnershipInstitutional;
  @Input({ required: true }) enterpriseValue?: EnterpriseValue;
  @Input() isLoading = false;
  @Input() displayType: 'institution' | 'position' | 'option' = 'institution';
}
