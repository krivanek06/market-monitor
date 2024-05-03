import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioTransactionsItemComponent } from './portfolio-transactions-item.component';

describe('PortfolioTransactionsItemComponent', () => {
  let component: PortfolioTransactionsItemComponent;
  let fixture: ComponentFixture<PortfolioTransactionsItemComponent>;

  beforeEach(async () => {
    MockBuilder(PortfolioTransactionsItemComponent);

    fixture = MockRender(PortfolioTransactionsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
