import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { StockSummary } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@market-monitor/shared-directives';

@Component({
  selector: 'app-stock-peers-list',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, PercentageIncreaseDirective, MatButtonModule, MatDividerModule],
  templateUrl: './stock-peers-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPeersListComponent {
  @Input() peers: StockSummary[] = [];
}
