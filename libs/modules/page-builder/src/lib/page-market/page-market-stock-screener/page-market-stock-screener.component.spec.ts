import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMarketStockScreenerComponent } from './page-market-stock-screener.component';

describe('PageMarketStockScreenerComponent', () => {
  let component: PageMarketStockScreenerComponent;
  let fixture: ComponentFixture<PageMarketStockScreenerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMarketStockScreenerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMarketStockScreenerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
