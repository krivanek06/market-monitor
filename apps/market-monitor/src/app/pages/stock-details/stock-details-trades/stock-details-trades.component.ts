import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-details-trades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-details-trades.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsTradesComponent {}
