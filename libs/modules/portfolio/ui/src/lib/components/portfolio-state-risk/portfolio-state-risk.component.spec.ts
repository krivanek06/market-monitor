import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioStateRiskComponent } from './portfolio-state-risk.component';

describe('PortfolioStateRiskComponent', () => {
  beforeEach(() => {
    return MockBuilder(PortfolioStateRiskComponent);
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioStateRiskComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
