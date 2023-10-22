import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPortfolioChartsComponent } from './dashboard-portfolio-charts.component';

describe('DashboardPortfolioChartsComponent', () => {
  let component: DashboardPortfolioChartsComponent;
  let fixture: ComponentFixture<DashboardPortfolioChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPortfolioChartsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPortfolioChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
