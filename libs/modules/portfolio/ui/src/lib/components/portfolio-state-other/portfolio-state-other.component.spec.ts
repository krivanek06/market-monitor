import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioStateOtherComponent } from './portfolio-state-other.component';

describe('PortfolioStateOtherComponent', () => {
  beforeEach(() => {
    MockBuilder(PortfolioStateOtherComponent);
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioStateOtherComponent);
    expect(fixture.componentRef.instance).toBeTruthy();
  });
});
