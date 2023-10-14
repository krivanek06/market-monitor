import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { SymbolSummary } from '@market-monitor/api-types';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  PriceChangeItemSelectorPipe,
} from '@market-monitor/shared/ui';
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
    DefaultImgDirective,
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
  @Input({ required: true }) symbolSummary!: SymbolSummary;
}
