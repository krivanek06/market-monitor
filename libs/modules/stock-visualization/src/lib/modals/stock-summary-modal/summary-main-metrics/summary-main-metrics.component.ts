import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ValuePresentationCardComponent } from '@market-monitor/components';
import { PercentageIncreaseDirective } from '@market-monitor/directives';
import { LargeNumberFormatterPipe } from '@market-monitor/pipes';
import { StockSummary } from '@market-monitor/shared-types';

@Component({
  selector: 'app-summary-main-metrics',
  standalone: true,
  imports: [CommonModule, ValuePresentationCardComponent, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  templateUrl: './summary-main-metrics.component.html',
  styleUrls: ['./summary-main-metrics.component.scss'],
})
export class SummaryMainMetricsComponent {
  @Input({ required: true }) stockSummary!: StockSummary;
}
