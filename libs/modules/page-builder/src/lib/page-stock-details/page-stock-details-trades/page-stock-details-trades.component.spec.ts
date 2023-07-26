import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStockDetailsTradesComponent } from '../stock-details-trades/stock-details-trades.component';

describe('PageStockDetailsTradesComponent', () => {
  let component: PageStockDetailsTradesComponent;
  let fixture: ComponentFixture<PageStockDetailsTradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStockDetailsTradesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStockDetailsTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
