import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockDetailsTradesComponent } from './stock-details-trades.component';

describe('StockDetailsTradesComponent', () => {
  let component: StockDetailsTradesComponent;
  let fixture: ComponentFixture<StockDetailsTradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockDetailsTradesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockDetailsTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
