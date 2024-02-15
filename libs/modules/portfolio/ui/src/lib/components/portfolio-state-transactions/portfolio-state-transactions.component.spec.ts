import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioStateTransactionsComponent } from './portfolio-state-transactions.component';

describe('PortfolioStateTransactionsComponent', () => {
  let component: PortfolioStateTransactionsComponent;
  let fixture: ComponentFixture<PortfolioStateTransactionsComponent>;

  beforeEach(async () => {
    MockBuilder(PortfolioStateTransactionsComponent);

    fixture = MockRender(PortfolioStateTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
