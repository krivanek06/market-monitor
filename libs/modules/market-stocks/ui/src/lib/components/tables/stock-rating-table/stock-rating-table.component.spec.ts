import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockRatingTableComponent } from './stock-rating-table.component';

describe('StockRatingTableComponent', () => {
  let component: StockRatingTableComponent;
  let fixture: ComponentFixture<StockRatingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockRatingTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockRatingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
