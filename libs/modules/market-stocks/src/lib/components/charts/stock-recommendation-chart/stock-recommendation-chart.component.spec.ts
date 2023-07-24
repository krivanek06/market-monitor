import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockRecommendationChartComponent } from './stock-recommendation-chart.component';

describe('StockRecommendationChartComponent', () => {
  let component: StockRecommendationChartComponent;
  let fixture: ComponentFixture<StockRecommendationChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockRecommendationChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockRecommendationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
