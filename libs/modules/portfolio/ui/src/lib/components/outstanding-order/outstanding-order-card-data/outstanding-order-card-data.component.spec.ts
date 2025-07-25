import { NgTemplateOutlet } from '@angular/common';
import { OutstandingOrder } from '@mm/api-types';
import { GeneralCardComponent } from '@mm/shared/ui';
import { MockBuilder, MockRender } from 'ng-mocks';
import { OutstandingOrderCardDataComponent } from './outstanding-order-card-data.component';

describe('OutstandingOrderCardDataComponent', () => {
  const exampleOrder = {
    createdAt: '2021-01-01T00:00:00Z',
    displaySymbol: 'AAPL',
    symbol: 'AAPL',
    sector: 'Technology',
    orderId: '123',
    orderType: {
      type: 'BUY',
    },
    status: 'OPEN',
  } as OutstandingOrder;

  beforeEach(() => {
    return MockBuilder(OutstandingOrderCardDataComponent).keep(NgTemplateOutlet).keep(GeneralCardComponent);
  });

  it('should create', () => {
    const fixture = MockRender(OutstandingOrderCardDataComponent, {
      order: exampleOrder,
    });
    const component = fixture.point.componentInstance;
    expect(component).toBeTruthy();
  });
});
