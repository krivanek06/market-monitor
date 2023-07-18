import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-stock-rating-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-rating-table.component.html',
  styleUrls: ['./stock-rating-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockRatingTableComponent {
  @Input() data: StockRatingTableComponent;
}
