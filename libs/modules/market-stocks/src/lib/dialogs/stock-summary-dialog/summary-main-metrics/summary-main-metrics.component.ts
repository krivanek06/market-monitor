import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StockSummary } from '@market-monitor/api-types';
import { GeneralCardComponent } from '@market-monitor/shared-components';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';
import { LargeNumberFormatterPipe } from '@market-monitor/shared-pipes';

@Component({
  selector: 'app-summary-main-metrics',
  standalone: true,
  imports: [CommonModule, GeneralCardComponent, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  templateUrl: './summary-main-metrics.component.html',
  styleUrls: ['./summary-main-metrics.component.scss'],
})
export class SummaryMainMetricsComponent {
  @Input({ required: true }) stockSummary!: StockSummary;
}
