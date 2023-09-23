import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CompanyRatingTable } from '@market-monitor/api-types';
import { LargeNumberFormatterPipe } from '@market-monitor/shared/ui';
import { RecommendationDirective } from '../../../directives';

@Component({
  selector: 'app-stock-rating-table',
  standalone: true,
  imports: [CommonModule, LargeNumberFormatterPipe, RecommendationDirective],
  templateUrl: './stock-rating-table.component.html',
  styleUrls: ['./stock-rating-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockRatingTableComponent {
  @Input({ required: true }) data!: CompanyRatingTable | null;
}
