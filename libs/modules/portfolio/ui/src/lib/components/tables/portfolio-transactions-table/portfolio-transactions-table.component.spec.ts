import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioTransactionsTableComponent } from './portfolio-transactions-table.component';

describe('PortfolioTransactionsTableComponent', () => {
  let component: PortfolioTransactionsTableComponent;
  let fixture: ComponentFixture<PortfolioTransactionsTableComponent>;

  beforeEach(async () => {
    MockBuilder(PortfolioTransactionsTableComponent);

    fixture = MockRender(PortfolioTransactionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
