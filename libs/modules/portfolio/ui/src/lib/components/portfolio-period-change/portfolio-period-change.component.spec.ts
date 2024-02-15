import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioPeriodChangeComponent } from './portfolio-period-change.component';

describe('PortfolioPeriodChangeComponent', () => {
  let component: PortfolioPeriodChangeComponent;
  let fixture: ComponentFixture<PortfolioPeriodChangeComponent>;

  beforeEach(async () => {
    MockBuilder(PortfolioPeriodChangeComponent);

    fixture = MockRender(PortfolioPeriodChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
