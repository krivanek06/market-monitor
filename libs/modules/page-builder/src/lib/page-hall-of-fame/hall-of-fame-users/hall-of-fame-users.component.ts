import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AggregationApiService } from '@market-monitor/api-client';
import { PortfolioRankTableComponent } from '@market-monitor/modules/portfolio/ui';

@Component({
  selector: 'app-hall-of-fame-users',
  standalone: true,
  imports: [CommonModule, PortfolioRankTableComponent],
  template: `<p>hall-of-fame-users works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HallOfFameUsersComponent {
  private aggregationApiService = inject(AggregationApiService);

  constructor() {
    this.aggregationApiService.getHallOfFameUsers().subscribe((users) => {
      console.log('hall_of_fame_users');
      console.log(users);
    });
  }
}
