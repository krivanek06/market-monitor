import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioTransactionsItemComponent } from './portfolio-transactions-item.component';

describe('PortfolioTransactionsItemComponent', () => {
  beforeEach(() => {
    return MockBuilder(PortfolioTransactionsItemComponent);
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioTransactionsItemComponent, {
      transaction: {},
    });
    const component = fixture.point.componentInstance;
    expect(component).toBeTruthy();
  });
});
