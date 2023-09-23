import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { StockDetails } from '@market-monitor/api-types';
import { PriceChangeItemSelectorPipe } from '@market-monitor/shared-components';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';
import { LargeNumberFormatterPipe } from '@market-monitor/shared-pipes';
import { RecommendationDirective } from '../../../directives';

@Component({
  selector: 'app-stock-summary-list',
  standalone: true,
  imports: [
    CommonModule,
    LargeNumberFormatterPipe,
    PercentageIncreaseDirective,
    RecommendationDirective,
    MatChipsModule,
    PriceChangeItemSelectorPipe,
  ],
  templateUrl: './stock-summary-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSummaryListComponent {
  @Input({ required: true }) stockDetails!: StockDetails;
}
