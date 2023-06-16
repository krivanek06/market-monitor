import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { GeneralCardComponent } from '@market-monitor/components';
import { RangeDirective } from '@market-monitor/directives';
import { StockSummary } from '@market-monitor/shared-types';
import { StockSummaryItemComponent } from '../../stock-summary-item/stock-summary-item.component';

@Component({
  selector: 'app-stock-summary-item-table',
  standalone: true,
  imports: [CommonModule, StockSummaryItemComponent, GeneralCardComponent, MatButtonModule, RangeDirective],
  templateUrl: './stock-summary-item-table.component.html',
  styleUrls: ['./stock-summary-item-table.component.scss'],
})
export class StockSummaryItemTableComponent {
  @Output() summaryClickEmitter = new EventEmitter<StockSummary>();
  @Input({ required: true }) stockSummaries!: StockSummary[] | null;
  @Input() tableTitle = '';
  @Input() showSkeleton: boolean = false;

  onSummaryClick(summary: StockSummary): void {
    this.summaryClickEmitter.emit(summary);
  }
}
