import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioGrowthChartsComponent } from './portfolio-growth-charts.component';

describe('PortfolioGrowthChartsComponent', () => {
  let component: PortfolioGrowthChartsComponent;
  let fixture: ComponentFixture<PortfolioGrowthChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioGrowthChartsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioGrowthChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
