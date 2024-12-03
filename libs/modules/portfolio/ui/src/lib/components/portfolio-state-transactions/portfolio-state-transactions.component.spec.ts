import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioStateTransactionsComponent } from './portfolio-state-transactions.component';

describe('PortfolioStateTransactionsComponent', () => {
  beforeEach(() => {
    return MockBuilder(PortfolioStateTransactionsComponent);
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioStateTransactionsComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
