import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioHoldingsTableCardComponent } from './portfolio-holdings-table-card.component';

describe('PortfolioHoldingsTableCardComponent', () => {
  beforeEach(() => {
    return MockBuilder(PortfolioHoldingsTableCardComponent);
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioHoldingsTableCardComponent, {
      portfolioStateHolding: undefined,
    });
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
