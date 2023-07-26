import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStockDetailsFinancialsComponent } from '../stock-details-financials/stock-details-financials.component';

describe('PageStockDetailsFinancialsComponent', () => {
  let component: PageStockDetailsFinancialsComponent;
  let fixture: ComponentFixture<PageStockDetailsFinancialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStockDetailsFinancialsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStockDetailsFinancialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
