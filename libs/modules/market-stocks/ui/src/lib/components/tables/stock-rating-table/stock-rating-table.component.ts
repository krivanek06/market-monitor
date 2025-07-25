import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CompanyRatingTable } from '@mm/api-types';
import { LargeNumberFormatterPipe } from '@mm/shared/ui';
import { RecommendationDirective } from '../../../directives';

@Component({
  selector: 'app-stock-rating-table',
  standalone: true,
  imports: [CommonModule, LargeNumberFormatterPipe, RecommendationDirective],
  template: `
    <div class="grid gap-2">
      <div class="g-item-wrapper">
        <div>Overall</div>
        <div class="flex items-center gap-2">
          <span>{{ data()?.rating }}</span>
          <div>(<span [appRecommendation]="data()?.ratingScore ?? 0"></span>)</div>
        </div>
      </div>

      <div class="g-item-wrapper">
        <div>Discounted Cash Flow</div>
        <div class="flex items-center gap-2">
          <div>{{ data()?.ratingDetailsDCFScoreValue | largeNumberFormatter: false : true }}</div>
          <div>(<span [appRecommendation]="data()?.ratingDetailsDCFScore"></span>)</div>
        </div>
      </div>

      <div class="g-item-wrapper">
        <div>Price to Earnings</div>
        <div class="flex items-center gap-2">
          <div>{{ data()?.ratingDetailsPEScoreValue | largeNumberFormatter: false : false }}</div>
          <div>(<span [appRecommendation]="data()?.ratingDetailsPEScore"></span>)</div>
        </div>
      </div>

      <div class="g-item-wrapper">
        <div>Price to Book</div>
        <div class="flex items-center gap-2">
          <div>{{ data()?.ratingDetailsPBScoreValue | largeNumberFormatter: false : false }}</div>
          <div>(<span [appRecommendation]="data()?.ratingDetailsPBScore"></span>)</div>
        </div>
      </div>

      <div class="g-item-wrapper">
        <div>Return on Equity</div>
        <div class="flex items-center gap-2">
          <div>{{ data()?.ratingDetailsROEScoreValue | largeNumberFormatter: true : false }}</div>
          <div>(<span [appRecommendation]="data()?.ratingDetailsROEScore"></span>)</div>
        </div>
      </div>

      <div class="g-item-wrapper">
        <div>Return on Assets</div>
        <div class="flex items-center gap-2">
          <div>{{ data()?.ratingDetailsROAScoreValue | largeNumberFormatter: true : false }}</div>
          <div>(<span [appRecommendation]="data()?.ratingDetailsROAScore"></span>)</div>
        </div>
      </div>

      <div class="g-item-wrapper">
        <div>Debt to Equity</div>
        <div class="flex items-center gap-2">
          <div>{{ data()?.ratingDetailsDEScoreValue | largeNumberFormatter: false : false }}</div>
          <div>(<span [appRecommendation]="data()?.ratingDetailsDEScore"></span>)</div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockRatingTableComponent {
  data = input.required<CompanyRatingTable | null>();
}
