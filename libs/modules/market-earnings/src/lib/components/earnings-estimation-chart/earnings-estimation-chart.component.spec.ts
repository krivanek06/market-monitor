import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EarningsEstimationChartComponent } from './earnings-estimation-chart.component';

describe('EarningsEstimationChartComponent', () => {
  let component: EarningsEstimationChartComponent;
  let fixture: ComponentFixture<EarningsEstimationChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarningsEstimationChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EarningsEstimationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
