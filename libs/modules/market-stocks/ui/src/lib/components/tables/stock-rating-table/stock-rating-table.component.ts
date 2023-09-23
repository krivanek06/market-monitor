import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StockDetails } from '@market-monitor/api-types';
import { LargeNumberFormatterPipe } from '@market-monitor/shared-pipes';
import { RecommendationDirective } from '../../../directives';
import { CompanyRatingTable, createCompanyRatingTable } from './stock-rating-table.model';

@Component({
  selector: 'app-stock-rating-table',
  standalone: true,
  imports: [CommonModule, LargeNumberFormatterPipe, RecommendationDirective],
  templateUrl: './stock-rating-table.component.html',
  styleUrls: ['./stock-rating-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockRatingTableComponent {
  @Input({ required: true, transform: (data: StockDetails) => createCompanyRatingTable(data) })
  data!: CompanyRatingTable | null;
}
