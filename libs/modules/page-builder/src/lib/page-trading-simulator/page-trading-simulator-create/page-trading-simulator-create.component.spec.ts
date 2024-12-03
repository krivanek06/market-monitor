import { MockBuilder, MockRender } from 'ng-mocks';
import { PageTradingSimulatorCreateComponent } from './page-trading-simulator-create.component';

describe('PageTradingSimulatorCreateComponent', () => {
  beforeEach(() => {
    return MockBuilder(PageTradingSimulatorCreateComponent);
  });

  it('should create', () => {
    const fixture = MockRender(PageTradingSimulatorCreateComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
