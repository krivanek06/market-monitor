import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PercentageIncreaseDirective } from '@market-monitor/directives';
import { LargeNumberFormatterPipe } from '@market-monitor/pipes';
import { StockSummary } from '@market-monitor/shared-types';

@Component({
  selector: 'app-stock-display-item',
  standalone: true,
  imports: [
    CommonModule,
    PercentageIncreaseDirective,
    LargeNumberFormatterPipe,
  ],
  templateUrl: './stock-display-item.component.html',
  styleUrls: ['./stock-display-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDisplayItemComponent {
  @Input({ required: true }) stockSummary!: StockSummary;
  @Input() displaySecondLine = false;
}
