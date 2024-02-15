import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioGrowthChartsComponent } from './portfolio-growth-charts.component';

describe('PortfolioGrowthChartsComponent', () => {
  let component: PortfolioGrowthChartsComponent;
  let fixture: ComponentFixture<PortfolioGrowthChartsComponent>;

  beforeEach(async () => {
    MockBuilder(PortfolioGrowthChartsComponent);

    fixture = MockRender(PortfolioGrowthChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
