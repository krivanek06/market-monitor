import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { SymbolSummary } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-peers-list',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, PercentageIncreaseDirective, MatButtonModule, MatDividerModule],
  templateUrl: './stock-peers-list.component.html',
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPeersListComponent {
  @Output() clickedEmitter = new EventEmitter<SymbolSummary>();
  @Input() peers: SymbolSummary[] = [];

  onItemClick(summary: SymbolSummary) {
    this.clickedEmitter.emit(summary);
  }
}
