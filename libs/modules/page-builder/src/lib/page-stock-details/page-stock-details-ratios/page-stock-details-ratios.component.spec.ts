import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStockDetailsRatiosComponent } from '../stock-details-ratios/stock-details-ratios.component';

describe('PageStockDetailsRatiosComponent', () => {
  let component: PageStockDetailsRatiosComponent;
  let fixture: ComponentFixture<PageStockDetailsRatiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStockDetailsRatiosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStockDetailsRatiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
