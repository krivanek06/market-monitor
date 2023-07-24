import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockDetailsFinancialsComponent } from './stock-details-financials.component';

describe('StockDetailsFinancialsComponent', () => {
  let component: StockDetailsFinancialsComponent;
  let fixture: ComponentFixture<StockDetailsFinancialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockDetailsFinancialsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockDetailsFinancialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
