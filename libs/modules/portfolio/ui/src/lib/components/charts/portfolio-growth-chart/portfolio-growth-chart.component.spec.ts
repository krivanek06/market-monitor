import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioGrowthChartComponent } from './portfolio-growth-chart.component';

describe('PortfolioGrowthChartComponent', () => {
  let component: PortfolioGrowthChartComponent;
  let fixture: ComponentFixture<PortfolioGrowthChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioGrowthChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioGrowthChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
