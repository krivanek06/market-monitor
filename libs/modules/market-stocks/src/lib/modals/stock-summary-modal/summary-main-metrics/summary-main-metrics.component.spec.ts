import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryMainMetricsComponent } from './summary-main-metrics.component';

describe('SummaryMainMetricsComponent', () => {
  let component: SummaryMainMetricsComponent;
  let fixture: ComponentFixture<SummaryMainMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryMainMetricsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryMainMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
