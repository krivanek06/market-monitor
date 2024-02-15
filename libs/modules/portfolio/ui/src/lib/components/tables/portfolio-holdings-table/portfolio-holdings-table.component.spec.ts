import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioHoldingsTableComponent } from './portfolio-holdings-table.component';

describe('PortfolioHoldingsTableComponent', () => {
  let component: PortfolioHoldingsTableComponent;
  let fixture: ComponentFixture<PortfolioHoldingsTableComponent>;

  beforeEach(async () => {
    MockBuilder(PortfolioHoldingsTableComponent);

    fixture = MockRender(PortfolioHoldingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
