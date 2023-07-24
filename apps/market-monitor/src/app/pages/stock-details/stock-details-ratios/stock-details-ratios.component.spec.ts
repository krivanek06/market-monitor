import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockDetailsRatiosComponent } from './stock-details-ratios.component';

describe('StockDetailsRatiosComponent', () => {
  let component: StockDetailsRatiosComponent;
  let fixture: ComponentFixture<StockDetailsRatiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockDetailsRatiosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockDetailsRatiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
