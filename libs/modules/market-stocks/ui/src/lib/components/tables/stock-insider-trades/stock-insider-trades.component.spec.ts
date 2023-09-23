import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockInsiderTradesComponent } from './stock-insider-trades.component';

describe('StockInsiderTradesComponent', () => {
  let component: StockInsiderTradesComponent;
  let fixture: ComponentFixture<StockInsiderTradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockInsiderTradesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockInsiderTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
