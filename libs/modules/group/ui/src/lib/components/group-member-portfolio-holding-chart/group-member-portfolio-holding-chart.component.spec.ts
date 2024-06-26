import { MockBuilder, MockRender } from 'ng-mocks';
import { GroupMemberPortfolioHoldingChartComponent } from './group-member-portfolio-holding-chart.component';

describe('GroupMemberPortfolioHoldingChartComponent', () => {
  beforeEach(() => {
    return MockBuilder(GroupMemberPortfolioHoldingChartComponent);
  });

  it('should create', () => {
    const fixture = MockRender(GroupMemberPortfolioHoldingChartComponent, {
      data: [],
    });
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
