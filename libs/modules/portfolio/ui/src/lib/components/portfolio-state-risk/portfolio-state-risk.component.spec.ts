import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioStateRiskComponent } from './portfolio-state-risk.component';

describe('PortfolioStateRiskComponent', () => {
  let component: PortfolioStateRiskComponent;
  let fixture: ComponentFixture<PortfolioStateRiskComponent>;

  beforeEach(() => {
    MockBuilder(PortfolioStateRiskComponent);

    fixture = MockRender(PortfolioStateRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
