import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { PortfolioStateOtherComponent } from './portfolio-state-other.component';

describe('PortfolioStateOtherComponent', () => {
  beforeEach(() => {
    return MockBuilder(PortfolioStateOtherComponent).keep(NG_MOCKS_ROOT_PROVIDERS);
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioStateOtherComponent);
    expect(fixture.componentRef.instance).toBeTruthy();
  });
});
