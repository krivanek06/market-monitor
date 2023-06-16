import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PercentageIncreaseDirective } from '@market-monitor/directives';
import { LargeNumberFormatterPipe } from '@market-monitor/pipes';
import { StockSummary } from '@market-monitor/shared-types';

@Component({
  selector: 'app-stock-summary-item',
  standalone: true,
  imports: [
    CommonModule,
    PercentageIncreaseDirective,
    LargeNumberFormatterPipe,
  ],
  templateUrl: './stock-summary-item.component.html',
  styleUrls: ['./stock-summary-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSummaryItemComponent {
  @Input({ required: true }) stockSummary!: StockSummary;
  @Input() displaySecondLine = false;
}
