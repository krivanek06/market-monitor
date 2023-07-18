import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockRecommendationComponent } from './stock-recommendation.component';

describe('StockRecommendationComponent', () => {
  let component: StockRecommendationComponent;
  let fixture: ComponentFixture<StockRecommendationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockRecommendationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
