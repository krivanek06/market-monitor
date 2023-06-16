import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockSummaryItemTableComponent } from './stock-summary-item-table.component';

describe('StockSummaryItemTableComponent', () => {
  let component: StockSummaryItemTableComponent;
  let fixture: ComponentFixture<StockSummaryItemTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSummaryItemTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSummaryItemTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
